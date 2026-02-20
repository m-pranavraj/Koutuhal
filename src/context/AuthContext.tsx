import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    authError: string | null;
    login: (credentials: { email?: string; password?: string; method: 'google' | 'email'; id_token?: string }) => Promise<void>;
    register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>;
    logout: () => Promise<void>;
    completeProfile: (data: { role: string; bio?: string; company?: string }) => Promise<void>;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const fetchUserProfile = async (authUser: SupabaseUser): Promise<User | null> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();

            if (error) {
                console.error('Error fetching user profile:', error);
                return null;
            }

            if (!data) {
                const newUser = {
                    id: authUser.id,
                    email: authUser.email!,
                    full_name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
                    role: 'STUDENT' as const,
                    profile_image_url: authUser.user_metadata?.avatar_url,
                    onboarding_completed: false,
                    is_active: true
                };

                const { data: insertedUser, error: insertError } = await supabase
                    .from('users')
                    .insert([newUser])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating user profile:', insertError);
                    return null;
                }

                return {
                    id: insertedUser.id,
                    full_name: insertedUser.full_name,
                    email: insertedUser.email,
                    profile_image_url: insertedUser.profile_image_url || undefined,
                    role: insertedUser.role,
                    onboarding_completed: insertedUser.onboarding_completed,
                    is_active: insertedUser.is_active,
                    created_at: insertedUser.created_at
                };
            }

            return {
                id: data.id,
                full_name: data.full_name,
                email: data.email,
                profile_image_url: data.profile_image_url || undefined,
                role: data.role,
                onboarding_completed: data.onboarding_completed,
                is_active: data.is_active,
                created_at: data.created_at
            };
        } catch (error) {
            console.error('Error in fetchUserProfile:', error);
            return null;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const userProfile = await fetchUserProfile(session.user);
                    if (userProfile) {
                        setUser(userProfile);
                        setIsAuthenticated(true);
                        setToken(session.access_token);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const userProfile = await fetchUserProfile(session.user);
                if (userProfile) {
                    setUser(userProfile);
                    setIsAuthenticated(true);
                    setToken(session.access_token);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsAuthenticated(false);
                setToken(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (credentials: { email?: string; password?: string; method: 'google' | 'email'; id_token?: string }) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            if (credentials.method === 'email' && credentials.email && credentials.password) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: credentials.email,
                    password: credentials.password,
                });

                if (error) throw new Error(error.message);

                if (data.user) {
                    const userProfile = await fetchUserProfile(data.user);
                    if (userProfile) {
                        setUser(userProfile);
                        setIsAuthenticated(true);
                        setToken(data.session?.access_token || null);
                    }
                }
            } else if (credentials.method === 'google') {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                });

                if (error) throw new Error(error.message);
            }
        } catch (error: any) {
            setAuthError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: { name: string; email: string; password: string; role: string }) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                    }
                }
            });

            if (error) throw new Error(error.message);

            if (data.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([{
                        id: data.user.id,
                        email: userData.email,
                        full_name: userData.name,
                        role: userData.role as 'STUDENT' | 'MENTOR' | 'ORGANISATION' | 'ADMIN' | 'SUPER_ADMIN',
                        onboarding_completed: false,
                        is_active: true
                    }]);

                if (profileError && profileError.code !== '23505') {
                    throw new Error(profileError.message);
                }

                const userProfile = await fetchUserProfile(data.user);
                if (userProfile) {
                    setUser(userProfile);
                    setIsAuthenticated(true);
                    setToken(data.session?.access_token || null);
                }
            }
        } catch (error: any) {
            setAuthError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const completeProfile = async (profileData: { role: string; bio?: string; company?: string }) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            if (!user) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('users')
                .update({
                    role: profileData.role as 'STUDENT' | 'MENTOR' | 'ORGANISATION' | 'ADMIN' | 'SUPER_ADMIN',
                    bio: profileData.bio || null,
                    company: profileData.company || null,
                    onboarding_completed: true
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw new Error(error.message);

            if (data) {
                setUser({
                    id: data.id,
                    full_name: data.full_name,
                    email: data.email,
                    profile_image_url: data.profile_image_url || undefined,
                    role: data.role,
                    onboarding_completed: data.onboarding_completed,
                    is_active: data.is_active,
                    created_at: data.created_at
                });
            }
        } catch (error: any) {
            setAuthError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setIsLoading(false);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading, authError, login, register, logout, completeProfile, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
