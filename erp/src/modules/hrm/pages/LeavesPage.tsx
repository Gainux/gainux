
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { leaveService } from "../services/leaveService";
import type { LeaveRequest } from "../types";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeavesPage() {
    const { profile, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
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
            // Fetch Employee Record needed for approvals
            const { data: employee } = await supabase
                .from('employees')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (employee) {
                setEmployeeId(employee.id);
            } else {
                setEmployeeId(null);
            }

            // Fetch ALL requests
            const globalRequests = await leaveService.getLeaveRequests(profile.org_id);
            setAllRequests(globalRequests);

        } catch (error) {
            console.error("Failed to load leave data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        let approverId = employeeId;

        if (!approverId && user?.id) {
            try {
                const { data } = await supabase.from('employees').select('id').eq('user_id', user.id).maybeSingle();
                if (data) approverId = data.id;
            } catch (err) { console.error(err); }
        }

        if (!approverId && (profile?.role === 'admin')) {
            // Admin override logic allowed
        } else if (!approverId) {
            return alert("Error: You need an employee profile to approve requests.");
        }

        try {
            await leaveService.approveLeave(requestId, approverId);
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to approve leave.");
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await leaveService.rejectLeave(requestId);
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to reject leave.");
        }
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
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">


            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Leave Management</h2>
                    <p className="text-muted-foreground">Manage employee leave requests.</p>
                </div>
            </div>

            <Tabs defaultValue="employee-requests" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="employee-requests">Employee Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="employee-requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Leave Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {allRequests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No pending requests found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Employee</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allRequests.map(req => (
                                                <TableRow key={req.id}>
                                                    <TableCell className="font-medium">
                                                        <div>{req.employee?.firstName} {req.employee?.lastName}</div>
                                                        <div className="text-xs text-muted-foreground">{req.employee?.employeeCode}</div>
                                                    </TableCell>
                                                    <TableCell>{req.leaveType?.name || 'Unknown'}</TableCell>
                                                    <TableCell>
                                                        {format(new Date(req.startDate), 'MMM dd')} - {format(new Date(req.endDate), 'MMM dd')}
                                                        <div className="text-xs text-muted-foreground">({req.daysCount} days)</div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={req.reason}>{req.reason || '-'}</TableCell>
                                                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                                                    <TableCell>
                                                        {req.status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleApprove(req.id)}>
                                                                    Approve
                                                                </Button>
                                                                <Button size="sm" variant="destructive" className="h-8" onClick={() => handleReject(req.id)}>
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
