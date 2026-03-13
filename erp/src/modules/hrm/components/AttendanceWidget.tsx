import { useState } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attendanceService } from "../services/attendanceService";
// In a real app, you'd get the current user's employee ID from auth context
const DEMO_EMPLOYEE_ID = "DEMO_ID";

export default function AttendanceWidget({ employeeId = DEMO_EMPLOYEE_ID }: { employeeId?: string }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'checked-in' | 'checked-out'>('checked-out'); // Simplified state

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            await attendanceService.checkIn(employeeId, "org-id-placeholder", new Date().toISOString().split('T')[0]);
            setStatus('checked-in');
        } catch (error) {
            console.error(error);
            alert("Failed to clock in");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setLoading(true);
            await attendanceService.checkOut(employeeId, new Date().toISOString().split('T')[0]);
            setStatus('checked-out');
        } catch (error) {
            console.error(error);
            alert("Failed to clock out");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Daily Attendance</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="text-lg md:text-2xl font-bold">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={handleCheckIn}
                            disabled={loading || status === 'checked-in'}
                        >
                            <LogIn className="mr-2 h-4 w-4" /> Clock In
                        </Button>
                        <Button
                            className="flex-1"
                            variant="secondary"
                            onClick={handleCheckOut}
                            disabled={loading || status === 'checked-out'}
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Clock Out
                        </Button>
                    </div>
                    {status === 'checked-in' && (
                        <p className="text-xs text-green-600 font-medium text-center">
                            You are currently clocked in
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
