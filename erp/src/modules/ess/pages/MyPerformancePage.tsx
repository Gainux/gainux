
import { useState, useEffect } from "react";
import {
    Activity,
    Target,
    ClipboardList,
    Clock,
    CheckCircle2,
    UserCheck,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { performanceService } from "../../hrm/services/performanceService";
import { employeeService } from "../../hrm/services/employeeService";
import type { PerformanceStats, Employee, PerformanceGoal, PerformanceReview } from "../../hrm/types";
import { format } from "date-fns";

export default function MyPerformancePage() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState<PerformanceStats | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [goals, setGoals] = useState<PerformanceGoal[]>([]);
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    useEffect(() => {
        const loadWrapper = async () => {
            if (!profile?.org_id || !user?.id) return;
            setLoading(true);
            try {
                const emp = await employeeService.getEmployeeByUserId(user.id);
                setEmployee(emp);

                if (emp) {
                    const [statsData, goalsData, reviewsData] = await Promise.all([
                        performanceService.getPerformanceStats(profile.org_id, emp.id, selectedMonth),
                        performanceService.getGoals(profile.org_id, emp.id),
                        performanceService.getReviews(profile.org_id, emp.id)
                    ]);
                    setStats(statsData);
                    setGoals(goalsData);
                    setReviews(reviewsData);
                }
            } catch (error) {
                console.error("Failed to load performance data", error);
            } finally {
                setLoading(false);
            }
        };

        loadWrapper();
    }, [user, profile, selectedMonth]);

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
        return <div className="p-8">Loading performance data...</div>;
    }

    if (!employee) {
        return (
            <div className="p-8">
                <Card className="bg-destructive/10 border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-semibold">Employee Record Not Found</p>
                        </div>
                        <p className="mt-2 text-sm">Please ensure your user account is linked to an employee profile to view performance.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">My Performance</h2>
                    <p className="text-muted-foreground">
                        Track your goals, reviews, and productivity metrics.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <MonthFilter />
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="goals">My Goals</TabsTrigger>
                    <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
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

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Goals</CardTitle>
                                <CardDescription>Your recently active goals.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {goals.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No active goals found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {goals.slice(0, 3).map(goal => (
                                            <div key={goal.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-sm">{goal.title}</p>
                                                    <p className="text-xs text-muted-foreground">Due: {goal.dueDate ? format(new Date(goal.dueDate), 'MMM d, yyyy') : 'No due date'}</p>
                                                </div>
                                                <Badge variant={
                                                    goal.status === 'completed' ? 'default' :
                                                        goal.status === 'in_progress' ? 'secondary' : 'outline'
                                                }>
                                                    {goal.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Reviews</CardTitle>
                                <CardDescription>Your latest performance appraisals.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reviews.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No reviews found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.slice(0, 3).map(review => (
                                            <div key={review.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-sm">{review.cycleName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Reviewed by: {review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'System'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={review.status === 'completed' || review.status === 'signed' ? 'default' : 'outline'}>
                                                        {review.status}
                                                    </Badge>
                                                    {review.rating && (
                                                        <span className="text-sm font-bold bg-muted px-2 py-1 rounded">
                                                            ★ {review.rating}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="goals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Goals</CardTitle>
                            <CardDescription>
                                All your performance objectives.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {goals.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>You have no set goals.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {goals.map(goal => (
                                        <div key={goal.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{goal.title}</h4>
                                                    {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                                                </div>
                                                <Badge variant={
                                                    goal.status === 'completed' ? 'default' :
                                                        goal.status === 'in_progress' ? 'secondary' : 'outline'
                                                }>
                                                    {goal.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Due: {goal.dueDate ? format(new Date(goal.dueDate), 'PPP') : 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Activity className="h-3 w-3" />
                                                    <span>Priority: {goal.priority}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span>Progress</span>
                                                    <span>{goal.progress}%</span>
                                                </div>
                                                <Progress value={goal.progress} className="h-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Reviews</CardTitle>
                            <CardDescription>
                                History of your performance appraisals.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {reviews.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No performance reviews found.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{review.cycleName}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Reviewed by: {review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'Unknown'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className="mb-1" variant={review.status === 'completed' || review.status === 'signed' ? 'default' : 'outline'}>
                                                        {review.status}
                                                    </Badge>
                                                    {review.reviewDate && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {format(new Date(review.reviewDate), 'PPP')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {review.status === 'completed' && (
                                                <div className="mt-4 bg-muted/50 p-4 rounded-md">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg font-bold">Rating: {review.rating}/5</span>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span key={star} className={`text-lg ${star <= (review.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {review.feedback && (
                                                        <div>
                                                            <p className="text-sm font-medium mb-1">Feedback:</p>
                                                            <p className="text-sm text-muted-foreground italic">"{review.feedback}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
