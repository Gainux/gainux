import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { ArrowLeft, Printer, FileText, Download } from "lucide-react";
import { toast } from "sonner";

import { useModules } from "@/context/ModuleContext";
import { useAuth } from "@/context/AuthContext";
import { payrollService } from "../services/payrollService";
import type { Payslip, Employee, PayrollRun } from "../types";
import { employeeService } from "../services/employeeService";
import { PayslipDialog } from "../components/PayslipDialog";
import { companyService } from "../../system/services/companyService";

export default function PayrollRunDetails() {
    const { id } = useParams<{ id: string }>();
    const { profile } = useAuth();
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());
    const [currentRun, setCurrentRun] = useState<PayrollRun | null>(null);
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState("Company Name");

    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (id && profile?.org_id) {
            loadData();
        }
    }, [id, profile?.org_id]);

    const loadData = async () => {
        if (!profile?.org_id || !id) return;

        try {
            setLoading(true);
            const [payslipData, employeeData, runData, orgData] = await Promise.all([
                payrollService.getPayslips(id),
                employeeService.getEmployees(profile.org_id),
                payrollService.getPayrollRunById(id),
                companyService.getOrganization(profile.org_id)
            ]);

            setPayslips(payslipData);
            setCurrentRun(runData);
            if (orgData) {
                setCompanyName(orgData.name);
            }

            const empMap = new Map();
            employeeData.forEach(e => empMap.set(e.id, e));
            setEmployees(empMap);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payroll details");
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = payslips.reduce((sum, p) => sum + p.netSalary, 0);

    const handleViewPayslip = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setIsDialogOpen(true);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/hrm/payroll">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Payroll Details</h2>
                    <p className="text-muted-foreground">
                        Review payslips and payout summary.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(totalAmount)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Safe To Pay</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{payslips.length} Employees</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payslips</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading payslips...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Gross Salary</TableHead>
                                    <TableHead>Deductions</TableHead>
                                    <TableHead className="font-bold">Net Salary</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payslips.map((slip) => {
                                    const employee = employees.get(slip.employeeId);
                                    return (
                                        <TableRow key={slip.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {employee?.employeeCode}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(slip.grossSalary)}
                                            </TableCell>
                                            <TableCell className="text-red-500">
                                                - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(slip.deductions)}
                                            </TableCell>
                                            <TableCell className="font-bold text-green-700">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(slip.netSalary)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{slip.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewPayslip(slip)}
                                                >
                                                    <FileText className="h-4 w-4 mr-2" /> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {selectedPayslip && currentRun && (
                <PayslipDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    payslip={selectedPayslip}
                    employee={employees.get(selectedPayslip.employeeId)!}
                    run={currentRun}
                    companyName={companyName}
                />
            )}
        </div>
    );
}
