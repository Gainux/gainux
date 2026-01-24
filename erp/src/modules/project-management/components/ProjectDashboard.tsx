import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { projectService } from "../services/projectService";

import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";

interface ProjectDashboardProps {
    projectId: string;
}

interface ProjectMetrics {
    budgetTotal: number;
    hoursLogged: number;
    billableRevenue: number;
    nonBillableHours: number;
    costOverrun: number;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
    const { isAdmin } = useAuth();
    const { formatAmount } = useCurrency();
    const [metrics, setMetrics] = useState<ProjectMetrics>({
        budgetTotal: 0,
        hoursLogged: 0,
        billableRevenue: 0,
        nonBillableHours: 0,
        costOverrun: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const projData = await projectService.getProjectById(projectId);


                // Fetch timesheets for this project
                const timesheets = await projectService.getTimesheets(projectId);

                const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
                const billableEntries = timesheets.filter(ts => ts.isBillable);
                const revenue = billableEntries.reduce((sum, ts) => {
                    return sum + (ts.hours * (ts.hourlyRate || 0));
                }, 0);
                const nonBillableHrs = timesheets.filter(ts => !ts.isBillable).reduce((sum, ts) => sum + ts.hours, 0);

                // Simple cost overrun: if revenue < budget, show difference
                const overrun = projData.budget - revenue;

                setMetrics({
                    budgetTotal: projData.budget,
                    hoursLogged: totalHours,
                    billableRevenue: revenue,
                    nonBillableHours: nonBillableHrs,
                    costOverrun: overrun
                });
            } catch (error) {
                console.error("Failed to load dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [projectId]);

    if (loading) {
        return <div className="p-4">Loading dashboard...</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Budget Card - Admin Only */}
            {isAdmin && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(metrics.budgetTotal)}</div>
                        <p className="text-xs text-muted-foreground">Total project budget</p>
                    </CardContent>
                </Card>
            )}

            {/* Billable Revenue Card - Admin Only */}
            {isAdmin && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Billable Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatAmount(metrics.billableRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {((metrics.billableRevenue / metrics.budgetTotal) * 100).toFixed(1)}% of budget
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Hours Logged Card - Visible to All */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.hoursLogged}h</div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.nonBillableHours}h non-billable
                    </p>
                </CardContent>
            </Card>

            {/* Budget Variance Card - Admin Only */}
            {isAdmin && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.costOverrun > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {metrics.costOverrun > 0 ? '-' : '+'}{formatAmount(Math.abs(metrics.costOverrun))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.costOverrun > 0 ? 'Under budget' : 'Over budget'}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
