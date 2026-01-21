import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { Calendar, Clock, UserCheck, Edit, Search, ChevronLeft, ChevronRight } from "lucide-react";
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

    // New filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'unmarked'>('all');

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
                    checkIn: status === 'present' ? new Date(`${date}T09:00:00`).toISOString() : undefined,
                    checkOut: status === 'present' ? new Date(`${date}T17:00:00`).toISOString() : undefined
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
                // Create date object in local time and convert to UTC
                return new Date(`${date}T${timeStr}:00`).toISOString();
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

    // Filter employees based on search and status
    const filteredEmployees = employees.filter(emp => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
            `${emp.employee.firstName} ${emp.employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.employee.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'present' && emp.attendance?.status === 'present') ||
            (statusFilter === 'absent' && emp.attendance?.status === 'absent') ||
            (statusFilter === 'unmarked' && !emp.attendance);

        return matchesSearch && matchesStatus;
    });

    // Calculate stats from all employees
    const stats = {
        total: employees.length,
        present: employees.filter(e => e.attendance?.status === 'present').length,
        absent: employees.filter(e => e.attendance?.status === 'absent').length,
        unmarked: employees.filter(e => !e.attendance).length
    };

    // Quick actions to mark all unmarked employees
    const handleMarkAllPresent = async () => {
        const unmarkedEmployees = employees.filter(e => !e.attendance);
        if (unmarkedEmployees.length === 0) {
            toast.info("All employees already marked");
            return;
        }

        setIsBulkSubmitting(true);
        try {
            await Promise.all(unmarkedEmployees.map(e =>
                attendanceService.markAttendance({
                    employeeId: e.employee.id,
                    status: 'present',
                    date: date,
                    checkIn: '09:00',
                    orgId: profile!.org_id,
                })
            ));
            toast.success(`Marked ${unmarkedEmployees.length} employees as present`);
            loadData();
        } catch (error) {
            toast.error("Failed to mark employees");
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    const handleMarkAllAbsent = async () => {
        const unmarkedEmployees = employees.filter(e => !e.attendance);
        if (unmarkedEmployees.length === 0) {
            toast.info("All employees already marked");
            return;
        }

        setIsBulkSubmitting(true);
        try {
            await Promise.all(unmarkedEmployees.map(e =>
                attendanceService.markAttendance({
                    employeeId: e.employee.id,
                    status: 'absent',
                    date: date,
                    orgId: profile!.org_id,
                })
            ));
            toast.success(`Marked ${unmarkedEmployees.length} employees as absent`);
            loadData();
        } catch (error) {
            toast.error("Failed to mark employees");
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    // Date navigation functions
    const goToPreviousDay = () => {
        const currentDate = new Date(date);
        const previousDay = subDays(currentDate, 1);
        setDate(previousDay.toISOString().split('T')[0]);
    };

    const goToNextDay = () => {
        const currentDate = new Date(date);
        const nextDay = addDays(currentDate, 1);
        setDate(nextDay.toISOString().split('T')[0]);
    };

    const goToToday = () => {
        setDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Header with Date Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
                    <p className="text-muted-foreground">
                        {format(new Date(date), 'EEEE, MMM d, yyyy')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border-0 p-0 h-auto w-32 focus-visible:ring-0"
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={goToNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={goToToday}>
                        Today
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employees by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        <SelectItem value="present">Present Only</SelectItem>
                        <SelectItem value="absent">Absent Only</SelectItem>
                        <SelectItem value="unmarked">Unmarked Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="default"
                    onClick={handleMarkAllPresent}
                    disabled={isBulkSubmitting || stats.unmarked === 0}
                >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Mark All Present ({stats.unmarked})
                </Button>
                <Button
                    variant="outline"
                    onClick={handleMarkAllAbsent}
                    disabled={isBulkSubmitting || stats.unmarked === 0}
                >
                    Mark All Absent ({stats.unmarked})
                </Button>
                <div className="ml-2 border-l pl-2">
                    <Button
                        variant="secondary"
                        onClick={() => handleBulkMark('present')}
                        disabled={selectedIds.length === 0 || isBulkSubmitting}
                        size="sm"
                    >
                        Mark Selected Present ({selectedIds.length})
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleBulkMark('absent')}
                        disabled={selectedIds.length === 0 || isBulkSubmitting}
                        size="sm"
                        className="ml-2"
                    >
                        Mark Selected Absent ({selectedIds.length})
                    </Button>
                </div>
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
                        ) : filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    {searchQuery || statusFilter !== 'all' ?
                                        'No employees match your filters' :
                                        'No active employees found'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((record) => (
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
                                    <TableCell>{getStatusBadge(record.attendance?.status || 'unmarked')}</TableCell>
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
