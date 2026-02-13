import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const [resumeData, setResumeData] = useState<ResumeData>(initialData);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Refs to track initial load and avoid saving on mount
    const isFirstLoad = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial load: Fetch existing or create new
    useEffect(() => {
        const loadResume = async () => {
            const token = localStorage.getItem('koutuhal_token');
            if (!token) {
                setIsFetching(false);
                return;
            }

            try {
                // 1. Try to fetch latest resume
                const response = await fetch('/resumes/latest', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.resume) {
                        setResumeData(data.resume);
                        setResumeId(data.id);
                    } else {
                        // 2. Create if none exists
                        await createNewResume(token);
                    }
                } else if (response.status === 404) {
                    await createNewResume(token);
                }
            } catch (err) {
                console.error("Failed to load resume:", err);
            } finally {
                setIsFetching(false);
                isFirstLoad.current = false;
            }
        };

        const createNewResume = async (token: string) => {
            const response = await fetch('/resumes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(initialData)
            });
            if (response.ok) {
                const data = await response.json();
                setResumeId(data.id);
            }
        };

        loadResume();
    }, []);

    // Debounced Autosave Logic
    useEffect(() => {
        if (isFirstLoad.current || !resumeId) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            saveResume();
        }, 2000); // 2 second debounce

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [resumeData, resumeId]);

    const saveResume = async () => {
        const token = localStorage.getItem('koutuhal_token');
        if (!token || !resumeId) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            const response = await fetch(`/resumes/${resumeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resumeData)
            });

            if (!response.ok) {
                throw new Error("Failed to autosave resume data");
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

    // Experience Actions
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

    // Education Actions
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

    // Skills Actions
    const updateSkills = (skills: string[]) => {
        setResumeData((prev) => ({ ...prev, skills }));
    };

    // Project Actions
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
