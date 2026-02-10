import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    isAuthenticated: boolean;
    user: { name: string; email: string; avatar?: string } | null;
    login: (method: 'google' | 'email') => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

    // Check localStorage on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem('koutuhal_auth');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
            setUser({
                name: 'Demo Student',
                email: 'student@koutuhal.ai',
                avatar: 'https://github.com/shadcn.png'
            });
        }
    }, []);

    const login = (method: 'google' | 'email') => {
        // Mock successful login
        setIsAuthenticated(true);
        setUser({
            name: 'Demo Student',
            email: 'student@koutuhal.ai',
            avatar: 'https://github.com/shadcn.png'
        });
        localStorage.setItem('koutuhal_auth', 'true');
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('koutuhal_auth');
        // We'll handle navigation in the component or basic window reload
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
