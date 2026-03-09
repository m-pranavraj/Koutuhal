import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

// ─── Typed profile shapes ────────────────────────────────────────────────────
type Profile = Database['public']['Tables']['profiles']['Row'];
type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];
type MentorProfile = Database['public']['Tables']['mentor_profiles']['Row'];
type OrgProfile = Database['public']['Tables']['organization_profiles']['Row'];
type CollegeProfile = Database['public']['Tables']['college_profiles']['Row'];

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextType {
    user: User | null;
    session: Session | null;

    // Multi-role system (user_roles table)
    roles: AppRole[];
    hasRole: (role: AppRole) => boolean;
    primaryRole: AppRole | null;

    // Base + role-specific profiles
    profile: Profile | null;
    studentProfile: StudentProfile | null;
    mentorProfile: MentorProfile | null;
    orgProfile: OrgProfile | null;
    collegeProfile: CollegeProfile | null;

    // FastAPI backend token (for compute APIs only)
    backendToken: string | null;

    loading: boolean;
    authReady: boolean;

    // Auth actions
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    assignRole: (role: AppRole, companyName?: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Exchange Supabase auth for a backend JWT (FastAPI compute APIs) ──────────
const exchangeForBackendToken = async (email: string): Promise<string | null> => {
    try {
        const res = await fetch('/api/v1/auth/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.access_token || null;
    } catch {
        return null;
    }
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
    const [orgProfile, setOrgProfile] = useState<OrgProfile | null>(null);
    const [collegeProfile, setCollegeProfile] = useState<CollegeProfile | null>(null);
    const [backendToken, setBackendToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [authReady, setAuthReady] = useState(false);

    const clearUserState = () => {
        setRoles([]);
        setProfile(null);
        setStudentProfile(null);
        setMentorProfile(null);
        setOrgProfile(null);
        setCollegeProfile(null);
        setBackendToken(null);
    };

    const fetchUserData = async (userId: string, email?: string) => {
        const [rolesRes, profileRes] = await Promise.all([
            supabase.from('user_roles').select('role').eq('user_id', userId),
            supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        ]);

        const userRoles: AppRole[] = rolesRes.error ? [] : (rolesRes.data ?? []).map((r) => r.role);
        setRoles(userRoles);
        setProfile(profileRes.error ? null : profileRes.data);

        // Fetch role-specific profiles in parallel
        await Promise.all([
            userRoles.includes('student')
                ? supabase.from('student_profiles').select('*').eq('user_id', userId).maybeSingle()
                    .then(({ data }) => setStudentProfile(data))
                : Promise.resolve(),
            userRoles.includes('mentor')
                ? supabase.from('mentor_profiles').select('*').eq('user_id', userId).maybeSingle()
                    .then(({ data }) => setMentorProfile(data))
                : Promise.resolve(),
            userRoles.includes('organization')
                ? supabase.from('organization_profiles').select('*').eq('user_id', userId).maybeSingle()
                    .then(({ data }) => setOrgProfile(data))
                : Promise.resolve(),
            userRoles.includes('college')
                ? supabase.from('college_profiles').select('*').eq('user_id', userId).maybeSingle()
                    .then(({ data }) => setCollegeProfile(data))
                : Promise.resolve(),
        ]);

        // Optionally exchange for FastAPI backend token
        if (email) {
            const token = await exchangeForBackendToken(email);
            if (token) {
                setBackendToken(token);
                localStorage.setItem('koutuhal_token', token);
            }
        }
    };

    // ─── Auth state listener ───────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!mounted) return;
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            setAuthReady(true);
        });

        void supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!mounted) return;
            setSession(s);
            setUser(s?.user ?? null);
            setAuthReady(true);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // ─── Hydrate user data when auth is ready ─────────────────────────────────
    useEffect(() => {
        let active = true;

        const hydrate = async () => {
            if (!authReady) { if (active) setLoading(true); return; }
            if (!user) { clearUserState(); if (active) setLoading(false); return; }

            if (active) setLoading(true);
            try {
                await fetchUserData(user.id, user.email);
            } finally {
                if (active) setLoading(false);
            }
        };

        void hydrate();
        return () => { active = false; };
    }, [authReady, user?.id]);

    // ─── Auth actions ──────────────────────────────────────────────────────────
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        if (data.user) {
            const { error: roleError } = await supabase.rpc('assign_user_role', {
                _user_id: data.user.id,
                _role: role,
                _company_name: (role === 'organization' || role === 'college') ? fullName : undefined,
            });
            if (roleError) throw roleError;
        }
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        clearUserState();
        localStorage.removeItem('koutuhal_token');
    };

    const assignRole = async (role: AppRole, companyName?: string) => {
        if (!user) throw new Error('Not authenticated');
        const { error } = await supabase.rpc('assign_user_role', {
            _user_id: user.id,
            _role: role,
            _company_name: companyName,
        });
        if (error) throw error;
        await fetchUserData(user.id, user.email);
    };

    const refreshProfile = async () => {
        if (!user) return;
        await fetchUserData(user.id, user.email);
    };

    const hasRole = (role: AppRole) => roles.includes(role);
    const primaryRole = roles[0] ?? null;

    return (
        <AuthContext.Provider value={{
            user, session, roles, hasRole, primaryRole,
            profile, studentProfile, mentorProfile, orgProfile, collegeProfile,
            backendToken, loading, authReady,
            signIn, signUp, signInWithGoogle, signOut, assignRole, refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
