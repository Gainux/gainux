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
import type { Attendance } from "../types";

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [stats, setStats] = useState({ present: 0, total: 0, absent: 0 });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

    // Edit Modal State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<{
        employeeId: string;
        firstName: string;
        lastName: string;
        status: string;
        clockIn: string;
        clockOut: string;
        notes: string;
    } | null>(null);

    useEffect(() => {
        loadData();
    }, [date]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [attendanceData, statsData, allEmployees] = await Promise.all([
                attendanceService.getAttendance(date),
                attendanceService.getTodayStats(),
                employeeService.getEmployees({ status: 'active' })
            ]);

            const mergedData = allEmployees.map(emp => {
                const att = attendanceData.find(a => a.employeeId === emp.id);
                return {
                    employee: emp,
                    attendance: att,
                    id: att?.id || emp.id
                };
            });

            setEmployees(mergedData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to load attendance", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkMark = async (status: 'present' | 'absent') => {
        if (selectedIds.length === 0) return;
        setIsBulkSubmitting(true);
        try {
            const updates = selectedIds.map(id => {
                const empRecord = employees.find(e => e.employee.id === id);
                if (!empRecord) return null;
                return {
                    employeeId: empRecord.employee.id,
                    date: date,
                    status: status,
                    clockIn: status === 'present' ? `${date}T09:00:00Z` : undefined,
                    clockOut: status === 'present' ? `${date}T17:00:00Z` : undefined
                };
            }).filter(Boolean) as any[];

            await attendanceService.bulkUpsertAttendance(updates);
            await loadData();
            setSelectedIds([]);
        } catch (error) {
            console.error("Bulk update failed", error);
            alert("Failed to update attendance");
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
            clockIn: att?.clockIn ? format(new Date(att.clockIn), 'HH:mm') : '',
            clockOut: att?.clockOut ? format(new Date(att.clockOut), 'HH:mm') : '',
            notes: att?.notes || ''
        });
        setIsDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingRecord) return;
        try {
            // Construct ISO strings from time inputs
            const constructDateTime = (timeStr: string) => {
                if (!timeStr) return null;
                return `${date}T${timeStr}:00Z`; // Z implies UTC usually, ideally handling timezones properly, but sticking to simple ISO for now
            };

            await attendanceService.upsertAttendance({
                employeeId: editingRecord.employeeId,
                date: date,
                status: editingRecord.status as any,
                clockIn: constructDateTime(editingRecord.clockIn) || undefined,
                clockOut: constructDateTime(editingRecord.clockOut) || undefined,
                notes: editingRecord.notes
            });

            setIsDialogOpen(false);
            setEditingRecord(null);
            await loadData();
        } catch (error) {
            console.error("Failed to update attendance", error);
            alert("Failed to save changes");
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
            half_day: "bg-blue-100 text-blue-800",
        };
        return (
            <Badge className={styles[status as keyof typeof styles] || ""} variant="secondary">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-2 bg-white border rounded-md px-3 py-1">
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

            <div className="rounded-md border bg-white">
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
                            <TableHead>Job Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Clock In</TableHead>
                            <TableHead>Clock Out</TableHead>
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
                                    <TableCell>{record.employee.jobTitle}</TableCell>
                                    <TableCell>{getStatusBadge(record.attendance?.status, record.leave)}</TableCell>
                                    <TableCell>
                                        {record.attendance?.clockIn ? format(new Date(record.attendance.clockIn), 'h:mm a') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {record.attendance?.clockOut ? format(new Date(record.attendance.clockOut), 'h:mm a') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {record.attendance?.clockIn && record.attendance?.clockOut ? (
                                            (() => {
                                                const start = new Date(record.attendance.clockIn).getTime();
                                                const end = new Date(record.attendance.clockOut).getTime();
                                                const hours = (end - start) / (1000 * 60 * 60);
                                                return `${hours.toFixed(1)} hrs`;
                                            })()
                                        ) : '-'}
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
                                <Label htmlFor="clockIn" className="text-right">Clock In</Label>
                                <Input
                                    id="clockIn"
                                    type="time"
                                    value={editingRecord.clockIn}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, clockIn: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="clockOut" className="text-right">Clock Out</Label>
                                <Input
                                    id="clockOut"
                                    type="time"
                                    value={editingRecord.clockOut}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, clockOut: e.target.value })}
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
