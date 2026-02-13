// Shared type definitions — NO mock data, only interfaces

export interface Job {
    id: number | string;
    title: string;
    company: string;
    type: 'Full-time' | 'Internship' | 'Contract';
    mode: 'WFO' | 'WFH' | 'Hybrid' | 'Remote';
    location: string;
    experience: string;
    salary: string;
    description: string;
    skills: string[];
    postedDays?: number;
    category?: string;
    match_score?: number;
}

export interface Course {
    id: number | string;
    title: string;
    instructor: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    price: string | number;
    rating: number;
    category: string;
    image: string;
    tags?: string[];
    description: string;
    perfectFor?: string[];
    isFree?: boolean;
    isPopular?: boolean;
}

export interface Mentor {
    id: number | string;
    name: string;
    title?: string;
    company?: string;
    experience?: string;
    rating?: number;
    image?: string;
    linkedin?: string;
    availability?: 'available' | 'limited' | 'waitlist';
    bio?: string | null;
    avatar_url?: string | null;
    xp_points?: number;
    skills?: string[];
    isAlumni?: boolean;
}

export interface Instructor {
    id: number;
    name: string;
    title: string;
    bio: string;
    image: string;
    experience: string;
    specialties: string[];
}

// Static filter options (not mock data — these are UI constants for filter dropdowns)
export const courseCategories = [
    "All", "Bootcamp", "Business", "AI Tools", "AI Applications",
    "Educational AI", "Creative AI", "AI Fundamentals", "Wellness"
];

export const courseLevels = ["All", "Beginner", "Intermediate", "Advanced"];
