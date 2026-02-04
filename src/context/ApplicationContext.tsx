import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Job } from '@/data/jobs';

export type ApplicationStatus = 'Applied' | 'Reviewing' | 'Shortlisted' | 'Interview' | 'Rejected' | 'Offer';

export interface Application {
    jobId: number;
    job: Job;
    appliedDate: string;
    status: ApplicationStatus;
    rank: number; // Simulated rank
    matchScore: number;
}

interface ApplicationContextType {
    appliedJobs: Application[];
    applyToJob: (job: Job, matchScore: number) => void;
    hasApplied: (jobId: number) => boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
    const [appliedJobs, setAppliedJobs] = useState<Application[]>([]);

    const applyToJob = (job: Job, matchScore: number) => {
        const newApplication: Application = {
            jobId: job.id,
            job,
            appliedDate: new Date().toLocaleDateString(),
            status: 'Applied',
            rank: Math.floor(Math.random() * 5) + 3, // Random rank 3-8
            matchScore
        };
        setAppliedJobs(prev => [newApplication, ...prev]);
    };

    const hasApplied = (jobId: number) => {
        return appliedJobs.some(app => app.jobId === jobId);
    };

    return (
        <ApplicationContext.Provider value={{ appliedJobs, applyToJob, hasApplied }}>
            {children}
        </ApplicationContext.Provider>
    );
};

export const useApplications = () => {
    const context = useContext(ApplicationContext);
    if (!context) throw new Error("useApplications must be used within ApplicationProvider");
    return context;
};
