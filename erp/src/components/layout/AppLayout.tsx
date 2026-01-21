import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

export default function AppLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="hidden md:flex h-screen w-full flex-col">
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-shrink-0">
                    <Sidebar
                        className={cn(
                            "border-r bg-sidebar transition-all duration-300 h-full",
                            isCollapsed ? "w-[70px]" : "w-72"
                        )}
                        isCollapsed={isCollapsed}
                        onToggle={() => setIsCollapsed(!isCollapsed)}
                    />
                </div>
                <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto bg-background focus:outline-none">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
