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
    Truck,
    Factory,
    Wrench,
    Map,
    ShieldCheck,
    LineChart,
    Workflow,
    Plug,
    Store,
    Activity,
    HardHat,
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    FileText,
    Calculator,
    Building,
    UserCheck,
    Calendar,
    ClipboardList,
    Wallet,
    Package,
    Clock,
    Shield,
    Zap,
    Layers,
    Receipt,
    Scale,
    GraduationCap,
    ClipboardCheck,
    FileSpreadsheet,
    ShieldAlert,
    BadgeCent,
    Repeat,
    FileCheck,
    Landmark,
    ScrollText,
    Box
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
            title: "Overview",
            moduleId: 'overview',
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
                    href: "/hrm/org",
                    label: "Organization",
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
                    href: "/crm/opportunities",
                    label: "Opportunities",
                    icon: Briefcase,
                    active: pathname.startsWith("/crm/opportunities"),
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
                    href: "/crm/contracts",
                    label: "Contracts",
                    icon: ScrollText,
                    active: pathname.startsWith("/crm/contracts"),
                },
                {
                    href: "/crm/subscriptions",
                    label: "Subscriptions",
                    icon: Repeat,
                    active: pathname.startsWith("/crm/subscriptions"),
                },
                {
                    href: "/crm/customers",
                    label: "Customers",
                    icon: Users,
                    active: pathname.startsWith("/crm/customers"),
                },
            ]
        },
        {
            title: "Procurement & Supply",
            moduleId: 'supply-chain',
            routes: [
                {
                    href: "/procurement/vendors",
                    label: "Vendor Mgmt",
                    icon: Users,
                    active: pathname.startsWith("/procurement/vendors"),
                },
                {
                    href: "/procurement/rfq",
                    label: "RFQs",
                    icon: FileText,
                    active: pathname.startsWith("/procurement/rfq"),
                },
                {
                    href: "/procurement/purchase-orders",
                    label: "Purchase Orders",
                    icon: ClipboardList,
                    active: pathname.startsWith("/procurement/purchase-orders"),
                },
                {
                    href: "/procurement/inventory",
                    label: "Inventory",
                    icon: Package,
                    active: pathname.startsWith("/procurement/inventory"),
                },
                {
                    href: "/procurement/warehouses",
                    label: "Warehouses",
                    icon: Box,
                    active: pathname.startsWith("/procurement/warehouses"),
                },
            ]
        },
        {
            title: "Manufacturing",
            moduleId: 'manufacturing',
            routes: [
                {
                    href: "/manufacturing/bom",
                    label: "Bill of Materials",
                    icon: Layers,
                    active: pathname.startsWith("/manufacturing/bom"),
                },
                {
                    href: "/manufacturing/planning",
                    label: "Production Plan",
                    icon: Calendar,
                    active: pathname.startsWith("/manufacturing/planning"),
                },
                {
                    href: "/manufacturing/shop-floor",
                    label: "Shop Floor",
                    icon: Factory,
                    active: pathname.startsWith("/manufacturing/shop-floor"),
                },
                {
                    href: "/manufacturing/quality",
                    label: "Quality Control",
                    icon: ClipboardCheck,
                    active: pathname.startsWith("/manufacturing/quality"),
                },
                {
                    href: "/manufacturing/costing",
                    label: "Job Costing",
                    icon: Calculator,
                    active: pathname.startsWith("/manufacturing/costing"),
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
                {
                    href: "/projects/billing",
                    label: "Billing & Costs",
                    icon: BadgeCent,
                    active: pathname.startsWith("/projects/billing"),
                },
            ]
        },
        {
            title: "Asset Management",
            moduleId: 'assets',
            routes: [
                {
                    href: "/assets/dashboard",
                    label: "Asset Register",
                    icon: Wrench,
                    active: pathname.startsWith("/assets/dashboard"),
                },
                {
                    href: "/assets/maintenance",
                    label: "Maintenance",
                    icon: Wrench,
                    active: pathname.startsWith("/assets/maintenance"),
                },
            ]
        },
        {
            title: "Logistics",
            moduleId: 'logistics',
            routes: [
                {
                    href: "/logistics/tms",
                    label: "Transport Mgmt",
                    icon: Truck,
                    active: pathname.startsWith("/logistics/tms"),
                },
                {
                    href: "/logistics/shipments",
                    label: "Shipments",
                    icon: Map,
                    active: pathname.startsWith("/logistics/shipments"),
                },
            ]
        },
        {
            title: "Quality & Risk",
            moduleId: 'quality',
            routes: [
                {
                    href: "/quality/qms",
                    label: "QMS",
                    icon: ShieldCheck,
                    active: pathname.startsWith("/quality/qms"),
                },
                {
                    href: "/quality/inspections",
                    label: "Inspections",
                    icon: ClipboardCheck,
                    active: pathname.startsWith("/quality/inspections"),
                },
                {
                    href: "/quality/compliance",
                    label: "Compliance",
                    icon: Shield,
                    active: pathname.startsWith("/quality/compliance"),
                },
            ]
        },
        {
            title: "BI & Analytics",
            moduleId: 'analytics',
            routes: [
                {
                    href: "/analytics/dashboards",
                    label: "Dashboards",
                    icon: LayoutDashboard,
                    active: pathname.startsWith("/analytics/dashboards"),
                },
                {
                    href: "/analytics/reports",
                    label: "Custom Reports",
                    icon: FileText,
                    active: pathname.startsWith("/analytics/reports"),
                },
                {
                    href: "/analytics/advanced",
                    label: "Advanced BI",
                    icon: LineChart,
                    active: pathname.startsWith("/analytics/advanced"),
                }
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
            title: "Retail (POS)",
            moduleId: 'retail',
            routes: [
                {
                    href: "/retail/pos",
                    label: "Point of Sale",
                    icon: Store,
                    active: pathname.startsWith("/retail/pos"),
                }
            ]
        },
        {
            title: "Healthcare (HIS)",
            moduleId: 'healthcare',
            routes: [
                {
                    href: "/healthcare/patients",
                    label: "Patients",
                    icon: Activity,
                    active: pathname.startsWith("/healthcare/patients"),
                },
                {
                    href: "/healthcare/appointments",
                    label: "Appointments",
                    icon: Calendar,
                    active: pathname.startsWith("/healthcare/appointments"),
                }
            ]
        },
        {
            title: "Construction",
            moduleId: 'construction',
            routes: [
                {
                    href: "/construction/sites",
                    label: "Site Management",
                    icon: HardHat,
                    active: pathname.startsWith("/construction/sites"),
                },
                {
                    href: "/construction/boq",
                    label: "BOQ",
                    icon: FileText,
                    active: pathname.startsWith("/construction/boq"),
                }
            ]
        },
        {
            title: "Marketplace",
            moduleId: 'marketplace',
            routes: [
                {
                    href: "/marketplace/products",
                    label: "App Store",
                    icon: Store,
                    active: pathname.startsWith("/marketplace/products"),
                },
                {
                    href: "/marketplace/orders",
                    label: "My Apps",
                    icon: Box,
                    active: pathname.startsWith("/marketplace/orders"),
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
    ].filter(group => isModuleEnabled(group.moduleId as any) && (group.moduleId !== 'system' || isAdmin));

    return (
        <div className={cn("pb-12 bg-sidebar h-full overflow-y-auto relative", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className={cn("mb-2 flex items-center gap-2", isCollapsed ? "justify-center px-0 flex-col" : "px-4 justify-between")}>

                        {isCollapsed ? (
                            <img src="/src/assets/logo.png" alt="Gainux Logo" className="h-8 w-auto mb-4" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <img src="/src/assets/logo.png" alt="Gainux Logo" className="h-8 w-auto" />
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
                                                    variant={route.active ? "secondary" : "ghost"}
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
