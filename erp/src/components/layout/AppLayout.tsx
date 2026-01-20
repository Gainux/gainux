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
                <Sidebar
                    className={cn(
                        "border-r bg-sidebar transition-all duration-300",
                        isCollapsed ? "w-[70px]" : "w-72"
                    )}
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto bg-background">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
