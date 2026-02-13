import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Job } from '@/types';

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
    applyToJob: (job: Job, matchScore: number) => Promise<Application>;
    hasApplied: (jobId: number) => boolean;
    isSubmitting: boolean;
    error: string | null;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
    const [appliedJobs, setAppliedJobs] = useState<Application[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch applications on mount
    React.useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem('koutuhal_token');
            if (!token) return;

            try {
                const response = await fetch('/applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAppliedJobs(data);
                }
            } catch (err) {
                console.error("Failed to fetch applications:", err);
            }
        };

        fetchApplications();
    }, []);

    const applyToJob = async (job: Job, matchScore: number) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('koutuhal_token');
            if (!token) throw new Error("You must be logged in to apply.");

            const response = await fetch(`/jobs/${job.id}/apply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ matchScore })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to apply.");
            }

            const newApplication = await response.json();

            // Optimistically update or re-fetch. Here we push the returned app object.
            // Ensure the backend returns the full Application object including job details if possible, 
            // or we merge it with the local job data.
            // Assuming backend returns { ...applicationData }

            setAppliedJobs(prev => [{ ...newApplication, job }, ...prev]);
            return { ...newApplication, job };

        } catch (err: any) {
            console.error(err);
            setError(err.message);
            // Re-throw if the component needs to know
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
