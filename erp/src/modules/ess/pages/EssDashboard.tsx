import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { CalendarCheck, Clock, FileText, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function EssDashboard() {
    const { profile } = useAuth();
    const today = new Date();

    return (
        <div className="flex-1 p-8 pt-6 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome, {profile?.full_name?.split(' ')[0] || 'Employee'}!</h2>
                    <p className="text-muted-foreground">
                        Here is an overview of your activity today, {format(today, 'EEEE, MMMM do, yyyy')}.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link to="/ess/attendance">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Check In/Out</div>
                            <p className="text-xs text-muted-foreground">Manage your daily attendance</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/ess/leaves">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Leaves</CardTitle>
                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Apply Leave</div>
                            <p className="text-xs text-muted-foreground">View balance & history</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/ess/performance">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Performance</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">My Stats</div>
                            <p className="text-xs text-muted-foreground">Goals & Reviews</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Placeholder for future Payslips */}
                <Card className="opacity-50 h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payslips</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Coming Soon</div>
                        <p className="text-xs text-muted-foreground">View salary slips</p>
                    </CardContent>
                </Card>
            </div>

            {/* We can add a "Recent Activity" or "Quote of the day" section here later */}
        </div>
    );
}
