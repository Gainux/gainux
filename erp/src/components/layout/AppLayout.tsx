import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function AppLayout() {
    return (
        <div className="hidden md:flex h-screen w-full flex-col">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar className="w-64 border-r bg-sidebar" />
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
