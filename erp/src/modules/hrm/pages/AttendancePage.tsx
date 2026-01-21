import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, UserCheck, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { attendanceService } from "../services/attendanceService";
import { employeeService } from "../services/employeeService";
import { useAuth } from "@/context/AuthContext";
import type { Employee, AttendanceLog } from "../types";
import { toast } from "sonner";


export default function AttendancePage() {
    const { profile } = useAuth();
    const [employees, setEmployees] = useState<Array<{ employee: Employee, attendance?: AttendanceLog }>>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

    // Edit Modal State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<{
        employeeId: string;
        firstName: string;
        lastName: string;
        status: string;
        checkIn: string;
        checkOut: string;
        notes: string;
    } | null>(null);

    useEffect(() => {
        if (profile?.org_id) {
            loadData();
        }
    }, [date, profile?.org_id]);

    const loadData = async () => {
        if (!profile?.org_id) return;

        try {
            setLoading(true);
            const [attendanceData, allEmployees] = await Promise.all([
                attendanceService.getAttendanceLogs(profile.org_id, date),
                employeeService.getEmployees(profile.org_id)
            ]);

            const activeEmployees = allEmployees.filter(emp => emp.status === 'active');

            const mergedData = activeEmployees.map(emp => {
                const att = attendanceData.find(a => a.employeeId === emp.id);
                return {
                    employee: emp,
                    attendance: att
                };
            });

            setEmployees(mergedData);
        } catch (error) {
            console.error("Failed to load attendance", error);
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };


    const handleBulkMark = async (status: 'present' | 'absent') => {
        if (selectedIds.length === 0 || !profile?.org_id) return;
        setIsBulkSubmitting(true);
        try {
            const updates = selectedIds.map(async (id) => {
                const empRecord = employees.find(e => e.employee.id === id);
                if (!empRecord) return;

                await attendanceService.markAttendance({
                    orgId: profile.org_id,
                    employeeId: id,
                    date: date,
                    status: status,
                    checkIn: status === 'present' ? `${date}T09:00:00Z` : undefined,
                    checkOut: status === 'present' ? `${date}T17:00:00Z` : undefined
                });
            });

            await Promise.all(updates);
            await loadData();
            setSelectedIds([]);
            toast.success(`Marked ${selectedIds.length} employees as ${status}`);
        } catch (error) {
            console.error("Bulk update failed", error);
            toast.error("Failed to update attendance");
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    const handleEdit = (record: any) => {
        const att = record.attendance;
        setEditingRecord({
            employeeId: record.employee.id,
            firstName: record.employee.firstName,
            lastName: record.employee.lastName,
            status: att?.status || 'present',
            checkIn: att?.checkIn ? format(new Date(att.checkIn), 'HH:mm') : '',
            checkOut: att?.checkOut ? format(new Date(att.checkOut), 'HH:mm') : '',
            notes: att?.notes || ''
        });
        setIsDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingRecord || !profile?.org_id) return;
        try {
            // Construct ISO strings from time inputs
            const constructDateTime = (timeStr: string) => {
                if (!timeStr) return undefined;
                return `${date}T${timeStr}:00Z`;
            };

            await attendanceService.markAttendance({
                orgId: profile.org_id,
                employeeId: editingRecord.employeeId,
                date: date,
                status: editingRecord.status as any,
                checkIn: constructDateTime(editingRecord.checkIn),
                checkOut: constructDateTime(editingRecord.checkOut),
                notes: editingRecord.notes
            });

            setIsDialogOpen(false);
            setEditingRecord(null);
            await loadData();
            toast.success("Attendance updated");
        } catch (error) {
            console.error("Failed to update attendance", error);
            toast.error("Failed to save changes");
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === employees.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(employees.map(e => e.employee.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(prev => prev !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };


    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline" className="text-gray-500">Not Marked</Badge>;
        const styles = {
            present: "bg-green-100 text-green-800",
            absent: "bg-red-100 text-red-800",
            late: "bg-yellow-100 text-yellow-800",
            'half-day': "bg-blue-100 text-blue-800",
            'on-leave': "bg-purple-100 text-purple-800",
        };
        return (
            <Badge className={styles[status as keyof typeof styles] || ""} variant="secondary">
                {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Badge>
        );
    };

    // Calculate stats from employee data
    const stats = {
        total: employees.length,
        present: employees.filter(e => e.attendance?.status === 'present').length,
        absent: employees.filter(e => !e.attendance || e.attendance.status === 'absent').length
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-2 border rounded-md px-3 py-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border-0 p-0 h-auto focus-visible:ring-0"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="default"
                    onClick={() => handleBulkMark('present')}
                    disabled={selectedIds.length === 0 || isBulkSubmitting}
                >
                    Mark Present
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => handleBulkMark('absent')}
                    disabled={selectedIds.length === 0 || isBulkSubmitting}
                >
                    Mark Absent
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.present}</div>
                        <p className="text-xs text-muted-foreground">{stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(0) : 0}% of workforce</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                        <Clock className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.absent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <UserCheck className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
            </div>


            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <input
                                    type="checkbox"
                                    checked={employees.length > 0 && selectedIds.length === employees.length}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300"
                                />
                            </TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Work Hours</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">No employees found.</TableCell>
                            </TableRow>
                        ) : (
                            employees.map((record) => (
                                <TableRow key={record.employee.id}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(record.employee.id)}
                                            onChange={() => toggleSelect(record.employee.id)}
                                            className="rounded border-gray-300"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {record.employee.firstName} {record.employee.lastName}
                                    </TableCell>
                                    <TableCell>{record.employee.designation?.title || '-'}</TableCell>
                                    <TableCell>{getStatusBadge(record.attendance?.status)}</TableCell>
                                    <TableCell>
                                        {record.attendance?.checkIn ? format(new Date(record.attendance.checkIn), 'h:mm a') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {record.attendance?.checkOut ? format(new Date(record.attendance.checkOut), 'h:mm a') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {record.attendance?.checkIn && record.attendance?.checkOut ? (() => {
                                            const start = new Date(record.attendance.checkIn).getTime();
                                            const end = new Date(record.attendance.checkOut).getTime();
                                            const hours = (end - start) / (1000 * 60 * 60);
                                            return `${hours.toFixed(1)} hrs`;
                                        })() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(record)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Attendance</DialogTitle>
                        <DialogDescription>
                            Update attendance details for {editingRecord?.firstName} {editingRecord?.lastName} on {date}.
                        </DialogDescription>
                    </DialogHeader>
                    {editingRecord && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                <Select
                                    value={editingRecord.status}
                                    onValueChange={(val) => setEditingRecord({ ...editingRecord, status: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                        <SelectItem value="half_day">Half Day</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="checkIn" className="text-right">Check In</Label>
                                <Input
                                    id="checkIn"
                                    type="time"
                                    value={editingRecord.checkIn}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, checkIn: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="checkOut" className="text-right">Check Out</Label>
                                <Input
                                    id="checkOut"
                                    type="time"
                                    value={editingRecord.checkOut}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, checkOut: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notes" className="text-right">Notes</Label>
                                <Input
                                    id="notes"
                                    value={editingRecord.notes}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
