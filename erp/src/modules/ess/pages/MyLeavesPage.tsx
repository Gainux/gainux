import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Calendar as CalendarIcon, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { leaveService } from "../../hrm/services/leaveService"; // Correct relative path
import type { LeaveRequest, LeaveBalance, LeaveType } from "../../hrm/types"; // Correct relative path
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export default function MyLeavesPage() {
    const { profile, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [selectedType, setSelectedType] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");

    const [employeeId, setEmployeeId] = useState<string | null>(null);

    useEffect(() => {
        if (profile?.org_id && user?.id) {
            loadData();
        }
    }, [profile, user]);

    const loadData = async () => {
        if (!profile?.org_id || !user?.id) return;
        setLoading(true);
        try {
            // 1. Fetch Leave Types
            const typesData = await leaveService.getLeaveTypes(profile.org_id);
            setLeaveTypes(typesData);

            // 2. Fetch Employee Record
            const { data: employee } = await supabase
                .from('employees')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (employee) {
                setEmployeeId(employee.id);
                const currentYear = new Date().getFullYear();

                const [balancesData, requestsData] = await Promise.all([
                    leaveService.getLeaveBalances(employee.id, currentYear),
                    leaveService.getLeaveRequests(profile.org_id, employee.id)
                ]);

                setBalances(balancesData);
                setMyRequests(requestsData);
            } else {
                setEmployeeId(null);
                setBalances([]);
                setMyRequests([]);
            }
        } catch (error) {
            console.error("Failed to load leave data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.org_id || !employeeId) {
            alert("You must be linked to an employee record to apply for leave.");
            return;
        }
        setSubmitting(true);

        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

            await leaveService.applyLeave({
                orgId: profile.org_id,
                employeeId: employeeId,
                leaveTypeId: selectedType,
                startDate,
                endDate,
                daysCount,
                reason
            });

            setIsApplyOpen(false);
            resetForm();
            loadData(); // Reload to see new request
        } catch (error) {
            console.error("Failed to apply leave", error);
            alert("Failed to apply for leave. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedType("");
        setStartDate("");
        setEndDate("");
        setReason("");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 md:pt-6 space-y-6">
            {!employeeId && !loading && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-md flex items-center gap-2 border border-yellow-200 dark:border-yellow-800">
                    <Clock className="h-5 w-5" />
                    <span>
                        <strong>Note:</strong> Your user account is not linked to an employee profile. You can view leave types but cannot apply for leave. Please contact your administrator.
                    </span>
                </div>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">My Leaves</h2>
                    <p className="text-muted-foreground">View your leave balances and request history.</p>
                </div>
                <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!employeeId}><Plus className="mr-2 h-4 w-4" /> Apply Leave</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleApply}>
                            <DialogHeader>
                                <DialogTitle>Apply for Leave</DialogTitle>
                                <DialogDescription>Fill in the details for your leave request.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Leave Type</Label>
                                    <Select value={selectedType} onValueChange={setSelectedType} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypes.map(type => (
                                                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Start Date</Label>
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>End Date</Label>
                                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Reason</Label>
                                    <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leave..." required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Leave Balances */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {leaveTypes.map(type => {
                    const balance = balances.find(b => b.leaveTypeId === type.id);
                    return (
                        <Card key={type.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{type.name}</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg md:text-2xl font-bold">{balance ? balance.daysRemaining : type.daysAllowedPerYear}</div>
                                <p className="text-xs text-muted-foreground">
                                    Available out of {type.daysAllowedPerYear} days
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* My Requests (Simplified Table) */}
            <Card>
                <CardHeader>
                    <CardTitle>My Leave History</CardTitle>
                </CardHeader>
                <CardContent>
                    {myRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No leave history found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied On</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myRequests.map(req => {
                                    const typeName = leaveTypes.find(t => t.id === req.leaveTypeId)?.name || 'Unknown';
                                    return (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.leaveType?.name || typeName}</TableCell>
                                            <TableCell>{format(new Date(req.startDate), 'MMM dd')} - {format(new Date(req.endDate), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell>{req.daysCount}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={req.reason}>{req.reason || '-'}</TableCell>
                                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                                            <TableCell>{format(new Date(req.createdAt), 'MMM dd, yyyy')}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
