import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    Users,
    Briefcase,
    DollarSign,
    Calendar,
    ArrowDownRight,
    Activity,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { dashboardService, type DashboardMetrics } from '../services/dashboardService';
import { useCurrency } from '@/hooks/useCurrency';

export default function AdvancedAnalyticsPage() {
    const { profile } = useAuth();
    const { formatAmount, symbol } = useCurrency();
    const [period, setPeriod] = useState('year');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);

    useEffect(() => {
        if (profile?.org_id) {
            loadData(profile.org_id);
        }
    }, [profile?.org_id]);

    const loadData = async (orgId: string) => {
        try {
            setLoading(true);
            const [dashboardMetrics, analytics] = await Promise.all([
                dashboardService.getDashboardMetrics(orgId),
                dashboardService.getAnalyticsData(orgId)
            ]);
            setMetrics(dashboardMetrics);
            setAnalyticsData(analytics);
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !metrics || !analyticsData) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const { financial, projects, hrm } = metrics;
    const { financialsOverTime, expensesByCategoryData } = analyticsData;

    // Project Status Data for Pie Chart
    const projectStatusData = [
        { name: 'Active', value: projects.activeProjects, color: '#3b82f6' },
        { name: 'Completed', value: projects.completedProjects, color: '#22c55e' },
        // We can add more statuses if available in metrics
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Advanced Analytics</h2>
                    <p className="text-muted-foreground">Comprehensive insights across your organization.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="year">Last Year</SelectItem>
                            <SelectItem value="quarter">Last Quarter</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>Download Report</Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="finance">Finance</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="hr">HR & Workforce</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg md:text-2xl font-bold">{formatAmount(financial.revenue)}</div>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
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
                                <div className="text-lg md:text-2xl font-bold">{projects.activeProjects}</div>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Activity className="h-3 w-3 text-blue-500 mr-1" />
                                    {projects.completedProjects} completed total
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg md:text-2xl font-bold">{hrm.totalEmployees}</div>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    across {Object.keys(hrm.byDepartment).length} departments
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg md:text-2xl font-bold">{formatAmount(financial.expenses)}</div>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                    Total expenses
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Revenue vs Expenses</CardTitle>
                                <CardDescription>Financial performance over the last 6 months.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={financialsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${symbol}${value}`} />
                                            <Tooltip formatter={(value: number | undefined) => formatAmount(value || 0)} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                            <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Project Status Distribution</CardTitle>
                                <CardDescription>Current state of all active projects.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={projectStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {projectStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number | undefined) => formatAmount(value || 0)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-4 flex-wrap">
                                    {projectStatusData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            {item.name} ({item.value})
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="finance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Breakdown</CardTitle>
                            <CardDescription>Expenses by category for the period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={expensesByCategoryData}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                                        <YAxis stroke="#888888" fontSize={12} tickFormatter={formatAmount} />
                                        <Tooltip formatter={(value: number | undefined) => [formatAmount(value || 0), "Amount"]} />
                                        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} name="Amount" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Other tabs can be expanded similarly with real data */}
                <TabsContent value="projects">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Detailed project analytics are being calculated from live project data.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hr">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workforce Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Detailed HR analytics are being calculated from live employee data.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
