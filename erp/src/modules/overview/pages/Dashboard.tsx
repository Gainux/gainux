import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { dashboardService, type DashboardMetrics } from "../services/dashboardService";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Briefcase, Users, TrendingUp, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import EmployeeDashboard from "./EmployeeDashboard";


import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

export default function Dashboard() {
    const { profile } = useAuth();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If employee, we don't need to load admin metrics
        if (profile?.role === 'employee') {
            setLoading(false);
            return;
        }

        if (profile?.org_id) {
            loadMetrics(profile.org_id);
        }
    }, [profile?.org_id, profile?.role]);

    const loadMetrics = async (orgId: string) => {
        try {
            const data = await dashboardService.getDashboardMetrics(orgId);
            setMetrics(data);
        } catch (error) {
            console.error("Failed to load dashboard metrics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (profile?.role === 'employee') {
        return <EmployeeDashboard />;
    }

    if (!metrics) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground">
                        Here's what's happening across your business today.
                    </p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(metrics.financial.revenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.projects.activeProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.projects.completedProjects} completed projects
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(metrics.crm.pipelineValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.crm.activeDeals} active opportunities
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.hrm.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {Object.keys(metrics.hrm.byDepartment).length} departments
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Sales Funnel</CardTitle>
                    <CardDescription>Deal distribution by stage</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.crm.funnel} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>
                        Your latest active and planned projects.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {metrics.projects.recentProjects.map((project) => (
                            <div key={project.id} className="flex items-center">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                    <Activity className="h-5 w-5 text-primary" />
                                </div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{project.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Client: {project.client?.name || 'Internal'}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    <Badge variant={
                                        project.status === 'completed' ? 'secondary' :
                                            project.status === 'in_progress' ? 'default' : 'outline'
                                    }>
                                        {project.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest confirmed sales orders</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {metrics.crm.recentOrders?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent orders found.</p>
                        ) : (
                            metrics.crm.recentOrders?.map((order) => (
                                <div key={order.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{order.orderNumber}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {formatCurrency(order.totalAmount)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Deals */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Opportunities</CardTitle>
                    <CardDescription>
                        Latest deals from the pipeline.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {metrics.crm.recentDeals.map((deal) => (
                            <div key={deal.id} className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{deal.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {deal.company?.name || 'N/A'}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    {formatCurrency(Number(deal.value))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

    );
}
