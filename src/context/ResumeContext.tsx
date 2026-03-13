import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Experience {
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface Education {
    id: string;
    degree: string;
    school: string;
    location: string;
    gradYear: string;
}

export interface Project {
    id: string;
    name: string;
    link: string;
    description: string;
}

export interface ResumeData {
    personal: {
        fullName: string;
        email: string;
        phone: string;
        linkedin: string;
        location: string;
        bio: string;
        website: string;
    };
    experience: Experience[];
    education: Education[];
    skills: string[];
    projects: Project[];
    templateId: string;
}

interface ResumeContextType {
    resumeData: ResumeData;
    isFetching: boolean;
    isSaving: boolean;
    saveError: string | null;
    updatePersonal: (field: keyof ResumeData['personal'], value: string) => void;
    addExperience: () => void;
    updateExperience: (id: string, field: keyof Experience, value: any) => void;
    removeExperience: (id: string) => void;
    addEducation: () => void;
    updateEducation: (id: string, field: keyof Education, value: any) => void;
    removeEducation: (id: string) => void;
    updateSkills: (skills: string[]) => void;
    addProject: () => void;
    updateProject: (id: string, field: keyof Project, value: string) => void;
    removeProject: (id: string) => void;
    setTemplateId: (id: ResumeData['templateId']) => void;
}

const initialData: ResumeData = {
    personal: {
        fullName: '',
        email: '',
        phone: '',
        linkedin: '',
        location: '',
        bio: '',
        website: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    templateId: 'modern',
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const parseResumePayload = (row: any): ResumeData => {
    const payload = row?.content ?? row?.raw_text;
    if (!payload) return initialData;
    if (typeof payload === 'object') return payload as ResumeData;
    if (typeof payload === 'string') {
        try {
            return JSON.parse(payload) as ResumeData;
        } catch {
            return initialData;
        }
    }
    return initialData;
};

const isMissingColumnError = (error: any) => {
    return error?.code === 'PGRST204' && String(error?.message || '').includes('column');
};

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [resumeData, setResumeData] = useState<ResumeData>(initialData);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const isFirstLoad = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user) {
            setIsFetching(false);
            return;
        }

        const loadResume = async () => {
            try {
                const { data, error } = await supabase
                    .from('resumes')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error loading resume:', error);
                    setIsFetching(false);
                    return;
                }

                if (data) {
                    setResumeData(parseResumePayload(data));
                    setResumeId(data.id);
                } else {
                    await createNewResume();
                }
            } catch (err) {
                console.error("Failed to load resume:", err);
            } finally {
                setIsFetching(false);
                isFirstLoad.current = false;
            }
        };

        loadResume();
    }, [user]);

    const createNewResume = async () => {
        if (!user) return;

        try {
            let data: any = null;
            let error: any = null;

            const candidatePayloads: any[] = [
                { user_id: user.id, title: 'My Resume', content: initialData },
                { user_id: user.id, title: 'My Resume', raw_text: JSON.stringify(initialData) },
                { user_id: user.id, raw_text: JSON.stringify(initialData) },
                { user_id: user.id },
            ];

            for (const payload of candidatePayloads) {
                const attempt = await supabase
                    .from('resumes')
                    .insert([payload])
                    .select()
                    .single();

                data = attempt.data;
                error = attempt.error as any;

                if (!error) break;
                if (!isMissingColumnError(error)) break;
            }

            if (error) {
                console.error('Error creating resume:', error);
                return;
            }

            if (data) {
                setResumeId(data.id);
            }
        } catch (err) {
            console.error('Failed to create resume:', err);
        }
    };

    useEffect(() => {
        if (isFirstLoad.current || !resumeId || !user) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            saveResume();
        }, 2000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [resumeData, resumeId, user]);

    const saveResume = async () => {
        if (!user || !resumeId) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            const now = new Date().toISOString();
            let error: any = null;

            const candidateUpdates: any[] = [
                { content: resumeData, updated_at: now },
                { raw_text: JSON.stringify(resumeData), updated_at: now },
                { content: resumeData },
                { raw_text: JSON.stringify(resumeData) },
            ];

            for (const updatePayload of candidateUpdates) {
                const attempt = await supabase
                    .from('resumes')
                    .update(updatePayload as any)
                    .eq('id', resumeId)
                    .eq('user_id', user.id);

                error = attempt.error as any;
                if (!error) break;
                if (!isMissingColumnError(error)) break;
            }

            // If schema is too old to support any content column, avoid noisy hard-fail on unrelated pages.
            if (error && isMissingColumnError(error)) {
                console.warn('Resume save skipped due to legacy resumes schema:', error.message);
                return;
            }

            if (error) {
                throw new Error(error.message);
            }
        } catch (err: any) {
            setSaveError(err.message);
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {
        setResumeData((prev) => ({
            ...prev,
            personal: { ...prev.personal, [field]: value },
        }));
    };

    const addExperience = () => {
        setResumeData((prev) => ({
            ...prev,
            experience: [
                ...prev.experience,
                {
                    id: uuidv4(),
                    role: '',
                    company: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: '',
                },
            ],
        }));
    };

    const updateExperience = (id: string, field: keyof Experience, value: any) => {
        setResumeData((prev) => ({
            ...prev,
            experience: prev.experience.map((exp) =>
                exp.id === id ? { ...exp, [field]: value } : exp
            ),
        }));
    };

    const removeExperience = (id: string) => {
        setResumeData((prev) => ({
            ...prev,
            experience: prev.experience.filter((exp) => exp.id !== id),
        }));
    };

    const addEducation = () => {
        setResumeData((prev) => ({
            ...prev,
            education: [
                ...prev.education,
                {
                    id: uuidv4(),
                    degree: '',
                    school: '',
                    location: '',
                    gradYear: '',
                },
            ],
        }));
    };

    const updateEducation = (id: string, field: keyof Education, value: any) => {
        setResumeData((prev) => ({
            ...prev,
            education: prev.education.map((edu) =>
                edu.id === id ? { ...edu, [field]: value } : edu
            ),
        }));
    };

    const removeEducation = (id: string) => {
        setResumeData((prev) => ({
            ...prev,
            education: prev.education.filter((edu) => edu.id !== id),
        }));
    };

    const updateSkills = (skills: string[]) => {
        setResumeData((prev) => ({ ...prev, skills }));
    };

    const addProject = () => {
        setResumeData((prev) => ({
            ...prev,
            projects: [
                ...prev.projects,
                { id: uuidv4(), name: '', link: '', description: '' },
            ],
        }));
    };

    const updateProject = (id: string, field: keyof Project, value: string) => {
        setResumeData((prev) => ({
            ...prev,
            projects: prev.projects.map((proj) =>
                proj.id === id ? { ...proj, [field]: value } : proj
            ),
        }));
    };

    const removeProject = (id: string) => {
        setResumeData((prev) => ({
            ...prev,
            projects: prev.projects.filter((proj) => proj.id !== id),
        }));
    };

    const setTemplateId = (id: ResumeData['templateId']) => {
        setResumeData((prev) => ({ ...prev, templateId: id }));
    };

    return (
        <ResumeContext.Provider
            value={{
                resumeData,
                isFetching,
                isSaving,
                saveError,
                updatePersonal,
                addExperience,
                updateExperience,
                removeExperience,
                addEducation,
                updateEducation,
                removeEducation,
                updateSkills,
                addProject,
                updateProject,
                removeProject,
                setTemplateId,
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
};

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (context === undefined) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
};
