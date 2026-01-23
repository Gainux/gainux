
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CalendarClock,
    CheckCircle2,
    Clock,
    Briefcase,
    CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { projectService } from "@/modules/project-management/services/projectService";
import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const [projectCount, setProjectCount] = useState("...");

    useEffect(() => {
        const fetchStats = async () => {
            if (profile?.role === 'employee' && user?.id) {
                const { data: employee } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (employee) {
                    const projects = await projectService.getProjects(employee.id);
                    setProjectCount(projects.length.toString());
                } else {
                    setProjectCount("0");
                }
            }
        };
        fetchStats();
    }, [profile, user]);

    // Mock data for now - could be connected to real APIs later
    const stats = [
        {
            title: "Attendance",
            value: "Present",
            description: "Clocked in at 09:00 AM",
            icon: Clock,
            color: "text-green-500",
            bg: "bg-green-100 dark:bg-green-900/20"
        },
        {
            title: "Leave Balance",
            value: "12 Days",
            description: "Annual leave remaining",
            icon: CalendarDays,
            color: "text-blue-500",
            bg: "bg-blue-100 dark:bg-blue-900/20"
        },
        {
            title: "Pending Tasks",
            value: "3",
            description: "Tasks due this week",
            icon: CheckCircle2,
            color: "text-orange-500",
            bg: "bg-orange-100 dark:bg-orange-900/20"
        },
        {
            title: "Projects",
            value: projectCount,
            description: "Active projects",
            icon: Briefcase,
            color: "text-purple-500",
            bg: "bg-purple-100 dark:bg-purple-900/20"
        }
    ];

    const quickActions = [
        { name: "Mark Attendance", path: "/hrm/attendance", icon: CalendarClock },
        { name: "Apply Leave", path: "/hrm/leaves", icon: CalendarDays },
        { name: "My Tasks", path: "/projects/tasks", icon: CheckCircle2 },
        { name: "My Projects", path: "/projects", icon: Briefcase },
    ];

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Employee'}! 👋
                    </h2>
                    <p className="text-muted-foreground">
                        Here's your personal overview for today.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Badge>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {quickActions.map((action, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
                                onClick={() => navigate(action.path)}
                            >
                                <action.icon className="h-6 w-6" />
                                <span>{action.name}</span>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Activity / Notifications Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Updates</CardTitle>
                        <CardDescription>Latest notifications and updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                <div className="mt-1 p-1 bg-blue-100 rounded-full dark:bg-blue-900/20">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Shift started</p>
                                    <p className="text-xs text-muted-foreground">You clocked in at 09:00 AM today</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                <div className="mt-1 p-1 bg-yellow-100 rounded-full dark:bg-yellow-900/20">
                                    <CheckCircle2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">New Task Assigned</p>
                                    <p className="text-xs text-muted-foreground">"Review Q1 Report" was assigned to you</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
