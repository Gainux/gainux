import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { Clock, ChevronLeft, ChevronRight, LogIn, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { attendanceService } from "../../hrm/services/attendanceService";
import { useAuth } from "@/context/AuthContext";
import type { AttendanceLog } from "../../hrm/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AttendanceGrid } from "../../hrm/components/AttendanceGrid";

export default function MyAttendancePage() {
    const { profile, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [monthlyLogs, setMonthlyLogs] = useState<AttendanceLog[]>([]);
    const [todayLog, setTodayLog] = useState<AttendanceLog | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [working, setWorking] = useState(false);

    useEffect(() => {
        if (profile?.org_id && user?.id) {
            loadData();
        }
    }, [profile, user, currentDate]);

    const loadData = async () => {
        if (!profile?.org_id || !user?.id) return;
        setLoading(true);

        try {
            // 1. Get Employee ID
            let empId = employeeId;
            if (!empId) {
                const { data } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (data) {
                    empId = data.id;
                    setEmployeeId(data.id);
                }
            }

            if (empId) {
                // 2. Fetch Monthly Logs
                const start = startOfMonth(currentDate).toISOString();
                const end = endOfMonth(currentDate).toISOString();
                const logs = await attendanceService.getAttendanceLogs(profile.org_id, undefined, start, end);
                const myLogs = logs.filter(l => l.employeeId === empId);
                setMonthlyLogs(myLogs);

                // 3. Fetch Today's Log specifically
                const todayStr = new Date().toISOString().split('T')[0];
                const todayRecord = myLogs.find(l => l.date === todayStr);
                setTodayLog(todayRecord || null);
            }
        } catch (error) {
            console.error("Failed to load attendance", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!employeeId || !profile?.org_id) return;
        setWorking(true);
        try {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            await attendanceService.markAttendance({
                orgId: profile.org_id,
                employeeId: employeeId,
                date: todayStr,
                status: 'present',
                checkIn: now.toISOString()
            });

            toast.success("Checked in successfully!");
            await loadData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to check in");
        } finally {
            setWorking(false);
        }
    };

    const handleCheckOut = async () => {
        if (!employeeId || !profile?.org_id || !todayLog?.id) return;
        setWorking(true);
        try {
            const now = new Date();
            // We need to keep the existing checkIn time and just add checkOut
            // The service markAttendance upserts, so we need to be careful not to overwrite checkIn if we don't pass it?
            // Actually attendanceService.markAttendance uses upsert. 
            // It expects checkIn and checkOut. If we only provide checkOut, what happens to checkIn?
            // Let's verify standard behavior. usually we pass both if known.

            await attendanceService.markAttendance({
                orgId: profile.org_id,
                employeeId: employeeId,
                date: todayLog.date,
                status: 'present',
                checkIn: todayLog.checkIn, // Preserve check-in
                checkOut: now.toISOString()
            });

            toast.success("Checked out successfully!");
            await loadData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to check out");
        } finally {
            setWorking(false);
        }
    };



    const stats = {
        present: monthlyLogs.filter(l => l.status === 'present').length,
        absent: monthlyLogs.filter(l => l.status === 'absent').length,
        late: monthlyLogs.filter(l => l.status === 'late').length,
    };

    return (
        <div className="flex-1 p-8 pt-6 space-y-6">
            {!employeeId && !loading && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-md flex items-center gap-2 border border-yellow-200 dark:border-yellow-800">
                    <Clock className="h-5 w-5" />
                    <span>
                        <strong>Note:</strong> Your account is not directly linked to an employee profile. Attendance cannot be tracked.
                    </span>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column: Today's Action & Stats */}
                <div className="w-full md:w-1/3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Attendance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2">{format(new Date(), 'h:mm a')}</div>
                                <div className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</div>
                            </div>

                            <div className="flex justify-center gap-4">
                                {todayLog?.checkIn ? (
                                    <div className="text-center w-full">
                                        <div className="text-sm text-muted-foreground mb-1">Checked In</div>
                                        <div className="font-semibold text-lg">{format(new Date(todayLog.checkIn), 'h:mm a')}</div>
                                    </div>
                                ) : (
                                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={handleCheckIn} disabled={!employeeId || working}>
                                        <LogIn className="mr-2 h-4 w-4" /> Check In
                                    </Button>
                                )}

                                {todayLog?.checkIn && !todayLog?.checkOut && (
                                    <Button size="lg" className="w-full" variant="destructive" onClick={handleCheckOut} disabled={working}>
                                        <LogOut className="mr-2 h-4 w-4" /> Check Out
                                    </Button>
                                )}

                                {todayLog?.checkOut && (
                                    <div className="text-center w-full">
                                        <div className="text-sm text-muted-foreground mb-1">Checked Out</div>
                                        <div className="font-semibold text-lg">{format(new Date(todayLog.checkOut), 'h:mm a')}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                                <div className="text-xs text-muted-foreground">Days Present</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                                <div className="text-xs text-muted-foreground">Days Absent</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Monthly Calendar */}
                <div className="w-full md:w-2/3">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Attendance History</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="font-medium min-w-[120px] text-center">
                                    {format(currentDate, 'MMMM yyyy')}
                                </div>
                                <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AttendanceGrid
                                employees={employeeId ? [{ employee: { id: employeeId } as any }] : []}
                                attendanceLogs={monthlyLogs}
                                currentDate={currentDate.toISOString().split('T')[0]}
                                onCellClick={() => { }} // No interaction for employee view
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
