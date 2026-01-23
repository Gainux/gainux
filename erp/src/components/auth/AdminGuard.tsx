import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminGuard() {
    const { isAdmin, isAuthenticated, loading } = useAuth() as any; // Cast to any if loading not yet in type def
    const navigate = useNavigate();
    // const location = useLocation();

    // Check loading first to avoid premature redirect
    // We need to ensure AuthContext gives us a loading state or we handle it based on session null

    useEffect(() => {
        if (!loading && isAuthenticated && !isAdmin) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, isAdmin, loading, navigate]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) return null; // Should be handled by ProtectedRoute, but safeguard

    // If verified admin, render children/outlet
    return isAdmin ? <Outlet /> : null;
}
