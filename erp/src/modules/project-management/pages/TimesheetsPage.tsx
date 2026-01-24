import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { projectService } from "../services/projectService";
import type { TimesheetEntry } from "../types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TimesheetForm } from "../components/TimesheetForm";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TimesheetsPage() {
    const { user, isAdmin } = useAuth();
    const { formatAmount } = useCurrency();
    const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Edit/Delete State
    const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadTimesheets();
    }, []);

    const loadTimesheets = async () => {
        try {
            const data = await projectService.getTimesheets();
            setTimesheets(data);
        } catch (error) {
            console.error("Failed to load timesheets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTimesheet = async (data: Partial<TimesheetEntry>) => {
        try {
            if (editingEntry) {
                // Update existing
                await projectService.updateTimesheetEntry(editingEntry.id, data);
            } else {
                // Create new
                // Fetch employee ID for current user (Quick Fix as per previous logic)
                const { data: employee } = await import("@/lib/supabase").then(m =>
                    m.supabase.from('employees').select('id').eq('user_id', user?.id).single()
                );

                if (!employee) {
                    alert("You must be an employee to log time.");
                    return;
                }

                await projectService.createTimesheetEntry({
                    ...data,
                    employeeId: employee.id
                });
            }

            setOpen(false);
            setEditingEntry(null);
            loadTimesheets();
        } catch (error) {
            console.error("Failed to save timesheet", error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await projectService.deleteTimesheetEntry(deleteId);
            setDeleteId(null);
            loadTimesheets();
        } catch (error) {
            console.error("Failed to delete timesheet", error);
        }
    };

    const openEdit = (entry: TimesheetEntry) => {
        setEditingEntry(entry);
        setOpen(true);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Timesheets</h2>
                    <p className="text-muted-foreground">Track projected hours and approvals.</p>
                </div>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) setEditingEntry(null);
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Log Time
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingEntry ? 'Edit Entry' : 'Log Time'}</DialogTitle>
                        </DialogHeader>
                        <TimesheetForm
                            initialData={editingEntry}
                            onSubmit={handleSaveTimesheet}
                            onCancel={() => {
                                setOpen(false);
                                setEditingEntry(null);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Timesheets</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : timesheets.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">No entries found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Hours</TableHead>
                                    {isAdmin && <TableHead>Billable</TableHead>}
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timesheets.map((entry: any) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{entry.date}</TableCell>
                                        <TableCell className="font-medium">
                                            {entry.projectName || <span className="text-muted-foreground text-xs">{entry.projectId}</span>}
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={entry.description}>
                                            {entry.description}
                                        </TableCell>
                                        <TableCell>{entry.hours}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                {entry.isBillable ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-green-600 font-medium">✓ Billable</span>
                                                        {entry.hourlyRate > 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatAmount(entry.hours * entry.hourlyRate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        )}
                                        <TableCell className="capitalize">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                entry.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {entry.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(entry.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this timesheet entry.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
