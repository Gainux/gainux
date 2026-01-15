import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Settings,
    Users,
    ShoppingCart,
    BarChart,
    Briefcase,
    CreditCard
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const location = useLocation();
    const pathname = location.pathname;

    const routeGroups = [
        {
            title: "Overview",
            routes: [
                {
                    href: "/",
                    label: "Dashboard",
                    icon: LayoutDashboard,
                    active: pathname === "/",
                },
                {
                    href: "/analytics",
                    label: "Analytics",
                    icon: BarChart,
                    active: pathname === "/analytics",
                },
            ]
        },
        {
            title: "CRM",
            routes: [
                {
                    href: "/crm/leads",
                    label: "Leads",
                    icon: Users,
                    active: pathname.startsWith("/crm/leads"),
                },
                {
                    href: "/crm/customers",
                    label: "Customers",
                    icon: Users,
                    active: pathname.startsWith("/crm/customers"),
                },
                {
                    href: "/crm/deals",
                    label: "Deals",
                    icon: Briefcase,
                    active: pathname.startsWith("/crm/deals"),
                },
            ]
        },
        {
            title: "HRM",
            routes: [
                {
                    href: "/hrm/employees",
                    label: "Employees",
                    icon: Users,
                    active: pathname.startsWith("/hrm/employees"),
                },
                {
                    href: "/hrm/attendance",
                    label: "Attendance",
                    icon: BarChart,
                    active: pathname.startsWith("/hrm/attendance"),
                },
            ]
        },
        {
            title: "Finance",
            routes: [
                {
                    href: "/finance/invoices",
                    label: "Invoices",
                    icon: CreditCard,
                    active: pathname.startsWith("/finance/invoices"),
                },
                {
                    href: "/finance/expenses",
                    label: "Expenses",
                    icon: ShoppingCart,
                    active: pathname.startsWith("/finance/expenses"),
                },
            ]
        },
        {
            title: "System",
            routes: [
                {
                    href: "/users",
                    label: "System Users",
                    icon: Users,
                    active: pathname === "/users",
                },
                {
                    href: "/settings",
                    label: "Settings",
                    icon: Settings,
                    active: pathname === "/settings",
                },
            ]
        }
    ];

    return (
        <div className={cn("pb-12 bg-sidebar", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-2 px-4 flex items-center gap-2">
                        <img src="/src/assets/logo.png" alt="Gainux Logo" className="h-8 w-auto" />
                        <h2 className="text-xl font-bold tracking-tight">Gainux</h2>
                    </div>
                    <div className="space-y-6 mt-6">
                        {routeGroups.map((group, i) => (
                            <div key={i} className="px-3">
                                <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                    {group.title}
                                </h3>
                                <div className="space-y-1">
                                    {group.routes.map((route) => (
                                        <Button
                                            key={route.href}
                                            variant={route.active ? "secondary" : "ghost"}
                                            className="w-full justify-start"
                                            asChild
                                        >
                                            <Link to={route.href}>
                                                <route.icon className="mr-2 h-4 w-4" />
                                                {route.label}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
