import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Job } from '@/types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type ApplicationStatus = 'Applied' | 'Reviewing' | 'Shortlisted' | 'Interview' | 'Rejected' | 'Offer';

export interface Application {
    jobId: number;
    job: Job;
    appliedDate: string;
    status: ApplicationStatus;
    rank: number;
    matchScore: number;
}

interface ApplicationContextType {
    appliedJobs: Application[];
    applyToJob: (job: Job, matchScore: number) => Promise<Application>;
    hasApplied: (jobId: number) => boolean;
    isSubmitting: boolean;
    error: string | null;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [appliedJobs, setAppliedJobs] = useState<Application[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchApplications = async () => {
            try {
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        *,
                        jobs (*)
                    `)
                    .eq('user_id', user.id)
                    .order('applied_at', { ascending: false });

                if (error) {
                    console.error('Error fetching applications:', error);
                    return;
                }

                if (data) {
                    const formattedApps = data.map((app: any) => ({
                        jobId: Number(app.job_id),
                        job: app.jobs,
                        appliedDate: app.applied_at,
                        status: app.status as ApplicationStatus,
                        rank: Math.floor(Math.random() * 100) + 1,
                        matchScore: 85
                    }));
                    setAppliedJobs(formattedApps);
                }
            } catch (err) {
                console.error("Failed to fetch applications:", err);
            }
        };

        fetchApplications();
    }, [user]);

    const applyToJob = async (job: Job, matchScore: number) => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (!user) throw new Error("You must be logged in to apply.");

            const { data, error } = await supabase
                .from('applications')
                .insert([{
                    user_id: user.id,
                    job_id: job.id,
                    status: 'Applied',
                    applied_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            const newApplication: Application = {
                jobId: Number(job.id),
                job,
                appliedDate: data.applied_at,
                status: 'Applied',
                rank: Math.floor(Math.random() * 100) + 1,
                matchScore
            };

            setAppliedJobs(prev => [newApplication, ...prev]);
            return newApplication;

        } catch (err: any) {
            console.error(err);
            setError(err.message);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasApplied = (jobId: number) => {
        return appliedJobs.some(app => app.jobId === jobId);
    };

    return (
        <ApplicationContext.Provider value={{ appliedJobs, applyToJob, hasApplied, isSubmitting, error }}>
            {children}
        </ApplicationContext.Provider>
    );
};

export const useApplications = () => {
    const context = useContext(ApplicationContext);
    if (!context) throw new Error("useApplications must be used within ApplicationProvider");
    return context;
};
