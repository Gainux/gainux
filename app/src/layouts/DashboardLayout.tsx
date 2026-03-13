import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Home, Wallet, User, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
            {/* Sidebar - Minimal Enterprise */}
            <aside className="w-[280px] bg-card border-r border-border/60 flex-col hidden md:flex relative z-10 transition-all duration-300">
                <div className="p-6 pb-2 flex items-center gap-3">
                    <img src="/logo.png" alt="Gainux Logo" className="h-10" />
                </div>

                <div className="px-4 py-4">
                    <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-widest mb-3 px-3">Menu</p>
                    <nav className="flex-1 space-y-1">
                        <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive("/dashboard") ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-foreground hover:bg-secondary"}`}>
                            <Home className={`w-4 h-4 ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`} /> Dashboard
                        </Link>
                        <Link to="/leads/new" className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive("/leads/new") ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-foreground hover:bg-secondary"}`}>
                            <PlusCircle className={`w-4 h-4 ${isActive("/leads/new") ? "text-primary" : "text-muted-foreground"}`} /> Submit Lead
                        </Link>
                        <Link to="/wallet" className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive("/wallet") ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-foreground hover:bg-secondary"}`}>
                            <Wallet className={`w-4 h-4 ${isActive("/wallet") ? "text-primary" : "text-muted-foreground"}`} /> Wallet
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-4 px-4 border-t border-border/50">
                    <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-widest mb-3 px-3">Account</p>
                    <Link to="/profile" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all mb-1 ${isActive("/profile") ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-foreground hover:bg-secondary/80"}`}>
                        <User className={`w-4 h-4 ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`} /> Profile
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-3 transition-colors h-9" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-3" /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                {/* Mobile Header */}
                <header className="bg-card border-b border-border/60 h-16 flex items-center px-6 md:hidden sticky top-0 z-20">
                    <img src="/logo.png" alt="Gainux Logo" className="w-6 h-6 rounded-md shadow-sm mr-3" />
                    <h1 className="text-lg font-bold tracking-tight">Gainux</h1>
                </header>

                <div className="flex-1 overflow-auto bg-background p-4 md:p-8 lg:p-10 transition-all duration-300">
                    <div className="mx-auto max-w-6xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
