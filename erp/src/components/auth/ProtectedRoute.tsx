import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    requireOrg?: boolean;
}

export default function ProtectedRoute({ requireOrg = true }: ProtectedRouteProps) {
    const { isAuthenticated, loading, profile } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If org is required but user has no org_id, redirect to onboarding
    if (requireOrg && !profile?.org_id) {
        return <Navigate to="/onboarding" replace />;
    }

    // If user is on onboarding (implied by requireOrg=false) but HAS an org, redirect to dashboard
    if (!requireOrg && profile?.org_id) {
        // Check if we are currently mostly on /onboarding pathway to avoid redirect loops if this component is reused elsewhere
        // But since we use exact routes, this "reverse guard" is helpful.
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
