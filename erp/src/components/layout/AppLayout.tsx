import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header, HeaderActions } from "./Header";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AppLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-muted/10">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full flex-shrink-0">
                <Sidebar
                    className={cn(
                        "border-r bg-sidebar transition-all duration-300 h-full",
                        isCollapsed ? "w-[70px]" : "w-72"
                    )}
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                />
            </div>

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden h-full">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b bg-background h-16 shrink-0">
                    <div className="flex items-center gap-2">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72">
                                <div className="h-full overflow-y-auto" onClick={(e) => {
                                    // Close on link click
                                    if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).closest('a')) {
                                        setMobileOpen(false);
                                    }
                                }}>
                                    <Sidebar className="border-none w-full h-full" />
                                    {/* Hide close button via CSS or just accept it's there */}
                                </div>
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Gainux Logo" className="h-6 w-auto" />
                            <span className="font-bold text-lg">Gainux</span>
                        </div>
                    </div>

                    <HeaderActions />
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block shrink-0">
                    <Header />
                </div>

                <main className="flex-1 overflow-y-auto bg-background focus:outline-none">
                    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
