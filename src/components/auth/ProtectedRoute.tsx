import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    /** If omitted, any authenticated user can access. */
    allowedRoles?: AppRole[];
    /** Where to go if not authenticated. Defaults to /login. */
    redirectTo?: string;
}

const ProtectedRoute = ({
    children,
    allowedRoles,
    redirectTo = '/login',
}: ProtectedRouteProps) => {
    const { user, roles, loading, authReady } = useAuth();
    const location = useLocation();

    // Wait until Supabase session + roles have been resolved
    if (!authReady || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#ADFF44] border-t-transparent rounded-full animate-spin" />
                    <p className="text-neutral-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated → redirect to login preserving intended URL
    if (!user) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Role required but user doesn't have it → redirect to dashboard home
    if (allowedRoles && allowedRoles.length > 0) {
        const hasPermission = allowedRoles.some((r) => roles.includes(r));
        if (!hasPermission) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
