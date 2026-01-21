import { useMemo } from 'react';
import { format, getDaysInMonth, startOfMonth, addDays, isSameDay } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Employee, AttendanceLog } from "../types";

interface AttendanceGridProps {
    employees: Array<{ employee: Employee, attendance?: AttendanceLog }>;
    currentDate: string; // ISO date string
    attendanceLogs: AttendanceLog[];
    onCellClick: (employeeId: string, date: string, currentStatus?: string) => void;
}

export function AttendanceGrid({
    employees,
    currentDate,
    attendanceLogs,
    onCellClick
}: AttendanceGridProps) {
    const monthDates = useMemo(() => {
        const start = startOfMonth(new Date(currentDate));
        const daysInMonth = getDaysInMonth(start);
        return Array.from({ length: daysInMonth }, (_, i) => addDays(start, i));
    }, [currentDate]);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'present': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200';
            case 'absent': return 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200';
            case 'half-day': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200';
            case 'on-leave': return 'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200';
            default: return 'bg-gray-50 text-gray-400 hover:bg-gray-100 border-transparent';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'present': return 'P';
            case 'absent': return 'A';
            case 'half-day': return 'HD';
            case 'on-leave': return 'L';
            default: return '';
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-full isolate">
            {/* Legend Header */}
            <div className="px-6 py-3 border-b bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                <div className="font-medium">Attendance Grid</div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Present</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Absent</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Half Day</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500"></div>On Leave</div>
                </div>
            </div>

            <div className="overflow-auto flex-1 relative">
                <Table>
                    <TableHeader className="bg-background sticky top-0 z-20 shadow-sm">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-[220px] sticky left-0 bg-background z-30 h-auto py-3 pl-6 font-semibold text-foreground border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                Employee
                            </TableHead>
                            {monthDates.map(date => {
                                const isWeekend = ["Sat", "Sun"].includes(format(date, 'EEE'));
                                const isToday = isSameDay(date, new Date());

                                return (
                                    <TableHead
                                        key={date.toISOString()}
                                        className={cn(
                                            "text-center min-w-[44px] px-1 py-2 h-auto border-r border-dashed last:border-r-0 transition-colors",
                                            isWeekend && "bg-muted/30",
                                            isToday && "bg-primary/5 text-primary font-bold"
                                        )}
                                    >
                                        <div className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5 leading-none">{format(date, 'EEE')}</div>
                                        <div className="text-sm font-medium leading-none">{format(date, 'd')}</div>
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map(({ employee }, index) => (
                            <TableRow key={employee.id} className="hover:bg-muted/30 border-b last:border-0 group">
                                <TableCell className="sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] py-3 pl-6 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm truncate max-w-[180px]">
                                            {employee.firstName} {employee.lastName}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                                            {employee.designation?.title || '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                {monthDates.map(date => {
                                    const dateStr = format(date, 'yyyy-MM-dd');
                                    const isWeekend = ["Sat", "Sun"].includes(format(date, 'EEE'));
                                    const log = attendanceLogs.find(
                                        l => l.employeeId === employee.id &&
                                            l.date === dateStr
                                    );

                                    return (
                                        <TableCell
                                            key={dateStr}
                                            className={cn(
                                                "p-1 text-center border-r border-dashed last:border-r-0 relative group/cell",
                                                isWeekend && "bg-muted/20"
                                            )}
                                        >
                                            <button
                                                onClick={() => onCellClick(employee.id, dateStr, log?.status)}
                                                className={cn(
                                                    "w-8 h-7 mx-auto flex items-center justify-center rounded-md border text-[10px] font-bold transition-all duration-200 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 select-none",
                                                    getStatusColor(log?.status),
                                                    !log?.status && "hover:border-primary/20 hover:bg-primary/5 group-hover/cell:border-muted-foreground/20"
                                                )}
                                                title={log ? `${log.status} - ${log.checkIn ? format(new Date(log.checkIn), 'HH:mm') : ''}` : 'Click to mark'}
                                            >
                                                {getStatusText(log?.status)}
                                            </button>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                        {employees.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={monthDates.length + 1} className="h-24 text-center text-muted-foreground">
                                    No employees found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
