import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";


import { useAuth } from "@/context/AuthContext";
import { payrollService } from "../services/payrollService";
import type { PayrollRun } from "../types";

export default function PayrollPage() {
    // const { currentOrg } = useModules();
    const { profile } = useAuth();
    const [runs, setRuns] = useState<PayrollRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);

    // Create form state
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString()); // 0-11
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (profile?.org_id) {
            loadRuns();
        }
    }, [profile?.org_id]);

    const loadRuns = async () => {
        if (!profile?.org_id) return;
        try {
            setLoading(true);
            const data = await payrollService.getPayrollRuns(profile.org_id);
            setRuns(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payroll runs");
        } finally {
            setLoading(false);
        }
    };

    const handleRunPayroll = async () => {
        if (!profile?.org_id || !profile.auth_id) {
            console.error("Missing profile data:", profile);
            toast.error("Missing organization or user information. Please try reloading.");
            return;
        }

        try {
            setIsSubmitting(true);
            const month = parseInt(selectedMonth) + 1; // 1-12
            const year = parseInt(selectedYear);

            // Check if run already exists
            const existing = runs.find(r => r.month === month && r.year === year);
            if (existing) {
                toast.error(`Payroll for ${format(new Date(year, month - 1), 'MMMM yyyy')} already exists`);
                return;
            }

            // 1. Create Run
            const newRun = await payrollService.createPayrollRun(profile.org_id, month, year, profile.auth_id);

            // 2. Generate Payslips — await so isSubmitting stays true and we reload after completion
            await toast.promise(
                payrollService.generatePayslips(newRun.id, profile.org_id),
                {
                    loading: 'Generating payslips...',
                    success: 'Payroll generated successfully',
                    error: 'Failed to generate payslips'
                }
            );
            setIsRunDialogOpen(false);
            loadRuns();
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate payroll run");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'processing': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case 'completed': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'; // Generated but not marked paid
            case 'draft': return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const months = Array.from({ length: 12 }, (_, i) => {
        return { value: i.toString(), label: format(new Date(2000, i, 1), 'MMMM') };
    });

    const years = Array.from({ length: 5 }, (_, i) => {
        const y = new Date().getFullYear() - 1 + i;
        return { value: y.toString(), label: y.toString() };
    });

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Payroll</h2>
                    <p className="text-muted-foreground">
                        Manage payroll cycles and generate employee payslips.
                    </p>
                </div>
                <Button onClick={() => setIsRunDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Run Payroll
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payroll History</CardTitle>
                    <CardDescription>
                        View past payroll runs and their status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading payroll data...</div>
                    ) : runs.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-medium">No payroll runs found</h3>
                            <p className="text-muted-foreground mb-4">Start by running payroll for the current month.</p>
                            <Button variant="outline" onClick={() => setIsRunDialogOpen(true)}>
                                Run Payroll
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Processed Date</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {runs.map((run) => (
                                        <TableRow key={run.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(run.year, run.month - 1), 'MMMM yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                {run.processedAt ? format(new Date(run.processedAt), 'PPP') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(run.totalAmount || 0)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getStatusColor(run.status)}>
                                                    {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link to={`/hrm/payroll/${run.id}`}>
                                                            View Details <ChevronRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={async () => {
                                                            if (confirm("Are you sure you want to delete this payroll run?")) {
                                                                try {
                                                                    await payrollService.deletePayrollRun(run.id);
                                                                    toast.success("Payroll run deleted");
                                                                    loadRuns();
                                                                } catch (error) {
                                                                    console.error(error);
                                                                    toast.error("Failed to delete payroll run");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Run Payroll</DialogTitle>
                        <DialogDescription>
                            Select the month and year to generate payroll for all active employees.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Month</Label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRunDialogOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleRunPayroll} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Payroll
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
