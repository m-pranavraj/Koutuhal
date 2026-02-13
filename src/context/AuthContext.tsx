import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'STUDENT' | 'MENTOR' | 'ORGANISATION' | 'ADMIN' | 'SUPER_ADMIN';
    onboarding_completed: boolean;
}

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

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            const storedToken = localStorage.getItem('koutuhal_token');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }
            setToken(storedToken);

            try {
                const response = await fetch('/api/v1/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('koutuhal_token');
                }
            } catch (error) {
                console.error("Session restoration failed:", error);
                localStorage.removeItem('koutuhal_token');
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (credentials: { email?: string; password?: string; method: 'google' | 'email'; id_token?: string }) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            let url = '/api/v1/auth/login/json';
            let body: any = { email: credentials.email, password: credentials.password };

            if (credentials.method === 'google') {
                url = '/api/v1/auth/google';
                body = { id_token: credentials.id_token };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                let errorMessage = 'Login failed';
                try {
                    const errorData = await response.json();
                    if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    } else if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map((e: any) => e.msg || String(e)).join(', ');
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    if (response.status === 500) {
                        errorMessage = "Server error (500). Please ensure your PostgreSQL database is running.";
                    } else {
                        errorMessage = `Server error (${response.status})`;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setIsAuthenticated(true);
            setUser(data.user);
            setToken(data.access_token);
            localStorage.setItem('koutuhal_token', data.access_token);

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
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                let errorMessage = 'Registration failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (e) {
                    if (response.status === 500) {
                        errorMessage = "Server error (500). Please ensure your PostgreSQL database is running and tables are created.";
                    } else {
                        errorMessage = `Server error (${response.status})`;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setIsAuthenticated(true);
            setUser(data.user);
            setToken(data.access_token);
            localStorage.setItem('koutuhal_token', data.access_token);
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
            const token = localStorage.getItem('koutuhal_token');
            const response = await fetch('/api/v1/users/set-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: profileData.role }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Role assignment failed');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);

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
            const token = localStorage.getItem('koutuhal_token');
            if (token) {
                await fetch('/api/v1/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('koutuhal_token');
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
