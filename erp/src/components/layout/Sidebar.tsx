import { useState } from "react";
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
    FolderKanban,
    Workflow,
    Plug,
    Activity,
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    FileText,
    Building,
    UserCheck,
    Calendar,
    Wallet,
    Clock,
    Shield,
    Zap,
    Receipt,
    Scale,
    GraduationCap,
    FileSpreadsheet,
    ShieldAlert,
    FileCheck,
    Landmark,
    RefreshCw
} from "lucide-react";
import { useModules } from "@/context/ModuleContext";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ className, isCollapsed = false, onToggle }: SidebarProps) {
    const location = useLocation();
    const pathname = location.pathname;
    const { isModuleEnabled } = useModules();
    const { isAdmin } = useAuth();

    // Initialize with common modules expanded
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        "Overview": true,
        "Finance & Accounting": true,
        "Human Resources": true,
        "Sales & CRM": true,
    });

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const routeGroups = [
        {
            title: "Employee Service",
            moduleId: 'overview', // Accessible to all
            routes: [
                {
                    href: "/ess/dashboard",
                    label: "Dashboard",
                    icon: LayoutDashboard,
                    active: pathname === "/ess/dashboard",
                },
                {
                    href: "/ess/leaves",
                    label: "My Leaves",
                    icon: Calendar,
                    active: pathname === "/ess/leaves",
                },
                {
                    href: "/ess/attendance",
                    label: "My Attendance",
                    icon: Clock,
                    active: pathname === "/ess/attendance",
                },
                {
                    href: "/ess/performance",
                    label: "My Performance",
                    icon: Activity,
                    active: pathname === "/ess/performance",
                },
            ]
        },
        {
            title: "Overview",
            moduleId: 'overview',
            routes: [
                {
                    href: "/",
                    label: "Admin Dashboard",
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
            title: "Finance & Accounting",
            moduleId: 'finance',
            routes: [
                {
                    href: "/finance/gl",
                    label: "General Ledger",
                    icon: FileSpreadsheet,
                    active: pathname.startsWith("/finance/gl"),
                },
                {
                    href: "/finance/invoices",
                    label: "Receivables (AR)",
                    icon: FileText,
                    active: pathname.startsWith("/finance/invoices"),
                },
                {
                    href: "/finance/payables",
                    label: "Payables (AP)",
                    icon: Receipt,
                    active: pathname.startsWith("/finance/payables"),
                },
                {
                    href: "/finance/expenses",
                    label: "Expenses",
                    icon: ShoppingCart,
                    active: pathname.startsWith("/finance/expenses"),
                },
                {
                    href: "/finance/banking",
                    label: "Cash & Bank",
                    icon: Landmark,
                    active: pathname.startsWith("/finance/banking"),
                },
                {
                    href: "/finance/budgeting",
                    label: "Budgeting",
                    icon: Scale,
                    active: pathname.startsWith("/finance/budgeting"),
                },
                {
                    href: "/finance/assets",
                    label: "Fixed Assets",
                    icon: Building,
                    active: pathname.startsWith("/finance/assets"),
                },
                {
                    href: "/finance/tax",
                    label: "Tax & Compliance",
                    icon: Shield,
                    active: pathname.startsWith("/finance/tax"),
                },
                {
                    href: "/finance/recurring",
                    label: "Recurring Receivable",
                    icon: RefreshCw,
                    active: pathname.startsWith("/finance/recurring") && !pathname.startsWith("/finance/recurring-expenses"),
                },
                {
                    href: "/finance/recurring-expenses",
                    label: "Recurring Payable",
                    icon: RefreshCw,
                    active: pathname.startsWith("/finance/recurring-expenses"),
                },
                {
                    href: "/finance/referral-payouts",
                    label: "Referral Payouts",
                    icon: Wallet,
                    active: pathname.startsWith("/finance/referral-payouts"),
                },
            ]
        },
        {
            title: "Human Resources (HCM)",
            moduleId: 'hrm',
            routes: [
                {
                    href: "/hrm/employees",
                    label: "Employee Master",
                    icon: Users,
                    active: pathname.startsWith("/hrm/employees"),
                },
                {
                    href: "/hrm/org-structure",
                    label: "Org Structure",
                    icon: Building,
                    active: pathname.startsWith("/hrm/org"),
                },
                {
                    href: "/hrm/attendance",
                    label: "Time & Attendance",
                    icon: Clock,
                    active: pathname.startsWith("/hrm/attendance"),
                },
                {
                    href: "/hrm/leaves",
                    label: "Leaves",
                    icon: Calendar,
                    active: pathname.startsWith("/hrm/leaves"),
                },
                {
                    href: "/hrm/payroll",
                    label: "Payroll",
                    icon: Wallet,
                    active: pathname.startsWith("/hrm/payroll"),
                },
                {
                    href: "/hrm/recruitment",
                    label: "Recruitment",
                    icon: UserCheck,
                    active: pathname.startsWith("/hrm/recruitment"),
                },
                {
                    href: "/hrm/performance",
                    label: "Performance",
                    icon: Activity,
                    active: pathname.startsWith("/hrm/performance"),
                },
                {
                    href: "/hrm/lms",
                    label: "Training (LMS)",
                    icon: GraduationCap,
                    active: pathname.startsWith("/hrm/lms"),
                },
            ]
        },
        {
            title: "Sales & CRM",
            moduleId: 'crm',
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
                    icon: Building,
                    active: pathname.startsWith("/crm/customers"),
                },
                {
                    href: "/crm/quotes",
                    label: "Quotations",
                    icon: FileText,
                    active: pathname.startsWith("/crm/quotes"),
                },
                {
                    href: "/crm/orders",
                    label: "Sales Orders",
                    icon: ShoppingCart,
                    active: pathname.startsWith("/crm/orders"),
                },
                {
                    href: "/crm/services",
                    label: "Services Catalog",
                    icon: Briefcase,
                    active: pathname.startsWith("/crm/services"),
                },
                {
                    href: "/crm/referral-leads",
                    label: "Referral Leads",
                    icon: Users,
                    active: pathname.startsWith("/crm/referral-leads"),
                },
            ]
        },

        {
            title: "Project Management",
            moduleId: 'projects',
            routes: [
                {
                    href: "/projects",
                    label: "Projects List",
                    icon: FolderKanban,
                    active: pathname === "/projects",
                },
                {
                    href: "/projects/resources",
                    label: "Resource Plan",
                    icon: Users,
                    active: pathname.startsWith("/projects/resources"),
                },
                {
                    href: "/projects/timesheets",
                    label: "Timesheets",
                    icon: Clock,
                    active: pathname.startsWith("/projects/timesheets"),
                },
            ].filter(route => route.label !== "Resource Plan" || isAdmin)
        },

        {
            title: "BI & Analytics",
            moduleId: 'analytics',
            routes: [
                {
                    href: "/analytics/advanced",
                    label: "Dashboards",
                    icon: LayoutDashboard,
                    active: pathname.startsWith("/analytics/advanced"),
                },
                {
                    href: "/analytics/reports",
                    label: "Custom Reports",
                    icon: FileText,
                    active: pathname.startsWith("/analytics/reports"),
                },

            ]
        },
        {
            title: "Workflow Automation",
            moduleId: 'automation',
            routes: [
                {
                    href: "/automation/workflows",
                    label: "Workflow Designer",
                    icon: Workflow,
                    active: pathname.startsWith("/automation"),
                },
                {
                    href: "/automation/rules",
                    label: "Business Rules",
                    icon: Zap,
                    active: pathname.startsWith("/automation/rules"),
                },
            ]
        },
        {
            title: "Integrations & API",
            moduleId: 'integrations',
            routes: [
                {
                    href: "/integrations/connected",
                    label: "Connected Apps",
                    icon: Plug,
                    active: pathname.startsWith("/integrations/connected"),
                },
                {
                    href: "/integrations/webhooks",
                    label: "Webhooks",
                    icon: Plug,
                    active: pathname.startsWith("/integrations/webhooks"),
                },
            ]
        },

        {
            title: "System & Security",
            moduleId: 'system',
            routes: [
                {
                    href: "/users",
                    label: "Users & Roles",
                    icon: Users,
                    active: pathname === "/users",
                },
                {
                    href: "/system/company",
                    label: "Company Settings",
                    icon: Building,
                    active: pathname.startsWith("/system/company"),
                },
                {
                    href: "/system/security",
                    label: "Security & Access",
                    icon: ShieldAlert,
                    active: pathname.startsWith("/system/security"),
                },

                {
                    href: "/system/audit",
                    label: "Audit Logs",
                    icon: FileCheck,
                    active: pathname.startsWith("/system/audit"),
                },
                {
                    href: "/settings",
                    label: "General Settings",
                    icon: Settings,
                    active: pathname === "/settings",
                },
            ]
        }
    ].filter(group => {
        if (group.title === "Employee Service") return !isAdmin;
        if (group.title === "Overview") return isAdmin;
        if (group.moduleId === 'system') return isAdmin;
        return isModuleEnabled(group.moduleId as any);
    });

    return (
        <div className={cn("pb-12 bg-sidebar/95 backdrop-blur-xl border-r shadow-sm h-full overflow-y-auto relative transition-all duration-300 ease-in-out", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className={cn("mb-2 flex items-center gap-2", isCollapsed ? "justify-center px-0 flex-col" : "px-4 justify-between")}>

                        {isCollapsed ? (
                            <img src="/logo.png" alt="Gainux Logo" className="h-8 w-auto mb-4" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Gainux Logo" className="h-8 w-auto" />
                                <h2 className="text-xl font-bold tracking-tight">Gainux</h2>
                            </div>
                        )}

                        {onToggle && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-6 w-6 text-muted-foreground hover:text-foreground", isCollapsed ? "mt-2" : "")}
                                onClick={onToggle}
                                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                            >
                                {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-6 mt-6">
                        {routeGroups.map((group, i) => {
                            const isOpen = openGroups[group.title] !== false;

                            // If collapsed, we show a divider or just the icons. 
                            // Since groups are collapsible in expanded mode, in collapsed mode we might just show all icons 
                            // or keep the grouping logic but hide headers.
                            // Let's hide headers in collapsed mode and show a separator.

                            if (group.routes.length === 0) return null;

                            return (
                                <div key={i} className={cn("px-3", isCollapsed ? "px-2" : "px-3")}>
                                    {!isCollapsed ? (
                                        <div
                                            className="flex items-center justify-between mb-2 px-4 cursor-pointer hover:text-foreground transition-colors group"
                                            onClick={() => toggleGroup(group.title)}
                                        >
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider group-hover:text-foreground">
                                                {group.title}
                                            </h3>
                                            {isOpen ? (
                                                <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="my-2 h-px bg-sidebar-border" />
                                    )}

                                    {(isOpen || isCollapsed) && (
                                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                                            {group.routes.map((route) => (
                                                <Button
                                                    key={route.href}
                                                    title={isCollapsed ? route.label : undefined}
                                                    variant={route.active ? "default" : "ghost"}
                                                    className={cn("w-full justify-start", isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "")}
                                                    asChild
                                                >
                                                    <Link to={route.href}>
                                                        <route.icon className={cn("h-4 w-4", isCollapsed ? "mr-0 h-5 w-5" : "mr-2")} />
                                                        {!isCollapsed && route.label}
                                                    </Link>
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
