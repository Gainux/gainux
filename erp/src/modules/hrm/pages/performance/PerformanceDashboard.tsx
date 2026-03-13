
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    Activity,
    Target,
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { performanceService } from "../../services/performanceService";
import { employeeService } from "../../services/employeeService";
import type { PerformanceStats, Employee } from "../../types";
import TeamPerformancePage from "./TeamPerformancePage";

export default function PerformanceDashboard() {
    const { user, profile } = useAuth();
    const { id: paramEmployeeId } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState<PerformanceStats | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    useEffect(() => {
        const loadDashboard = async () => {
            if (!profile?.org_id) return;

            try {
                let emp: Employee | null = null;

                if (paramEmployeeId) {
                    // Viewing specific employee
                    emp = await employeeService.getEmployeeById(paramEmployeeId);
                } else if (user?.id) {
                    // Viewing self
                    emp = await employeeService.getEmployeeByUserId(user.id);
                }

                setEmployee(emp);

                if (emp) {
                    const statsData = await performanceService.getPerformanceStats(profile.org_id, emp.id, selectedMonth);
                    setStats(statsData);
                }
            } catch (error) {
                console.error("Failed to load dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [user, profile, paramEmployeeId, selectedMonth]);

    // Generate last 12 months for filter
    const getLast12Months = () => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(d);
        }
        return months;
    };

    const monthOptions = getLast12Months();

    // Helper to format month
    const formatMonth = (date: Date) => {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const MonthFilter = () => (
        <Select
            value={selectedMonth.toISOString()}
            onValueChange={(val) => setSelectedMonth(new Date(val))}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Month">
                    {formatMonth(selectedMonth)}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {monthOptions.map((date) => (
                    <SelectItem key={date.toISOString()} value={date.toISOString()}>
                        {formatMonth(date)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    if (loading) {
        return <div className="p-8">Loading performance metrics...</div>;
    }

    const isManager = profile?.role === 'admin' || profile?.role === 'manager';
    // If they have an employee record, they can see their own stats
    const hasEmployeeRecord = !!employee;

    // Loading state handled above

    // If NOT manager and NO employee record, show error
    if (!isManager && !hasEmployeeRecord) {
        return (
            <div className="p-8">
                <Card className="bg-destructive/10 border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-semibold">Employee Record Not Found</p>
                        </div>
                        <p className="mt-2 text-sm">Please ensure your user account is linked to an employee profile to view performance metrics.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Determine available tabs
    // Managers see Team View. Employees see My View.
    // If someone is BOTH (Manager with Employee record), they might see both, 
    // but user asked for "Team only to managers" layout preference. 
    // Let's implement:
    // - Managers: Team Overview (default) + My Overview (if they have record)
    // - Employees: Only My Overview

    const defaultTab = isManager ? "team-overview" : "my-overview";

    // If viewing a specific employee as admin/manager
    if (paramEmployeeId && employee) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/hrm/performance')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Team
                    </Button>
                </div>
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold tracking-tight">
                            {employee.firstName} {employee.lastName}
                        </h2>
                        <p className="text-muted-foreground">
                            Performance Overview ({employee.designation?.title || 'Employee'})
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <MonthFilter />
                    </div>
                </div>

                {/* Reuse the My Overview content layout directly */}
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg md:text-2xl font-bold">{stats?.taskCompletionRate?.toFixed(0)}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.completedTasks} / {stats?.totalTasks} tasks completed
                                </p>
                                <Progress value={stats?.taskCompletionRate} className="mt-3 h-2" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg md:text-2xl font-bold">{stats?.attendanceRate?.toFixed(0)}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.presentDays} present days this month
                                </p>
                                <Progress value={stats?.attendanceRate} className="mt-3 h-2" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Timesheet Hours</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg md:text-2xl font-bold">{stats?.timesheetHours}h</div>
                                <p className="text-xs text-muted-foreground">
                                    Logged this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg md:text-2xl font-bold">{stats?.averageRating || '-'} / 5</div>
                                <p className="text-xs text-muted-foreground">
                                    Last review score
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Performance Goals</CardTitle>
                                <CardDescription>
                                    Active objectives and key results.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="flex flex-col gap-4 p-4 items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg bg-muted/50">
                                    <Target className="h-10 w-10 text-muted-foreground" />
                                    <div className="text-center">
                                        <h3 className="font-semibold">Goals</h3>
                                        <p className="text-sm text-muted-foreground mb-4">View or manage goals for this employee.</p>
                                        <Button asChild>
                                            {/* We can pass query params or context in future to filter GoalList by employeeId */}
                                            <Link to="/hrm/performance/goals">Manage Goals</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Reviews & Feedback</CardTitle>
                                <CardDescription>
                                    Performance reviews history.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4 p-4 items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg bg-muted/50">
                                    <ClipboardList className="h-10 w-10 text-muted-foreground" />
                                    <div className="text-center">
                                        <h3 className="font-semibold">Performance Reviews</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Conduct or view appraisals.</p>
                                        <Button variant="outline" asChild>
                                            <Link to="/hrm/performance/reviews">View Reviews</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Performance Overview</h2>
                    <p className="text-muted-foreground">
                        Track your goals, reviews, and productivity metrics.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {(hasEmployeeRecord || isManager) && <MonthFilter />}
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-4">
                <TabsList>
                    {hasEmployeeRecord && (
                        <TabsTrigger value="my-overview">My Overview</TabsTrigger>
                    )}
                    {isManager && (
                        <TabsTrigger value="team-overview">Team Overview</TabsTrigger>
                    )}
                </TabsList>

                {hasEmployeeRecord && (
                    <TabsContent value="my-overview" className="space-y-4">
                        {/* Integration Stats Overview */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg md:text-2xl font-bold">{stats?.taskCompletionRate?.toFixed(0)}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.completedTasks} / {stats?.totalTasks} tasks completed
                                    </p>
                                    <Progress value={stats?.taskCompletionRate} className="mt-3 h-2" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg md:text-2xl font-bold">{stats?.attendanceRate?.toFixed(0)}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.presentDays} present days this month
                                    </p>
                                    <Progress value={stats?.attendanceRate} className="mt-3 h-2" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Timesheet Hours</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg md:text-2xl font-bold">{stats?.timesheetHours}h</div>
                                    <p className="text-xs text-muted-foreground">
                                        Logged this month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg md:text-2xl font-bold">{stats?.averageRating || '-'} / 5</div>
                                    <p className="text-xs text-muted-foreground">
                                        Last review score
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions / Navigation */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Performance Goals</CardTitle>
                                    <CardDescription>
                                        Your active objectives and key results.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <div className="flex flex-col gap-4 p-4 items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg bg-muted/50">
                                        <Target className="h-10 w-10 text-muted-foreground" />
                                        <div className="text-center">
                                            <h3 className="font-semibold">Track Your Goals</h3>
                                            <p className="text-sm text-muted-foreground mb-4">Set and monitor your performance objectives.</p>
                                            <Button asChild>
                                                <Link to="/hrm/performance/goals">Manage Goals</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Reviews & Feedback</CardTitle>
                                    <CardDescription>
                                        Upcoming and past performance reviews.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-4 p-4 items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg bg-muted/50">
                                        <ClipboardList className="h-10 w-10 text-muted-foreground" />
                                        <div className="text-center">
                                            <h3 className="font-semibold">Performance Reviews</h3>
                                            <p className="text-sm text-muted-foreground mb-4">View your appraisals and feedback.</p>
                                            <Button variant="outline" asChild>
                                                <Link to="/hrm/performance/reviews">View Reviews</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                )}

                {isManager && (
                    <TabsContent value="team-overview">
                        <TeamPerformancePage selectedMonth={selectedMonth} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
