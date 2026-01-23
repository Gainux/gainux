import { useRef } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Payslip, Employee, PayrollRun } from "../types";

interface PayslipDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payslip: Payslip;
    employee: Employee;
    run: PayrollRun; // To show period info
    companyName: string;
}

export function PayslipDialog({ open, onOpenChange, payslip, employee, run, companyName }: PayslipDialogProps) {
    // const { currentOrg } = useModules(); // currentOrg is not available in ModuleContext
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML;
        const originalContent = document.body.innerHTML;

        if (printContent) {
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload(); // Reload to restore event listeners
        }
    };

    const periodStr = `${format(new Date(run.year, run.month - 1), 'MMMM yyyy')}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Payslip - {periodStr}</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
                            <Printer className="h-4 w-4 mr-2" /> Print
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6 print:p-8" ref={printRef} id="payslip-content">
                    {/* Header: Company & Employee Info */}
                    <div className="flex justify-between items-start border-b pb-4">
                        <div>
                            <h2 className="text-xl font-bold uppercase">{companyName}</h2>
                            <p className="text-sm text-muted-foreground">Payslip for the month of {periodStr}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{employee.designation?.title || 'Employee'}</p>
                            <p className="text-xs text-muted-foreground">{employee.employeeCode}</p>
                        </div>
                    </div>

                    {/* Earnings & Deductions Tables */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Earnings */}
                        <div>
                            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Earnings</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>Basic Salary</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payslip.basicSalary)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>HRA</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payslip.hra)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>Allowances</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payslip.allowances)}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2 mt-2">
                                    <span>Gross Earnings</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payslip.grossSalary)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div>
                            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Deductions</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>Standard Deductions</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payslip.deductions)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>Tax (TDS)</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payslip.tax)}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2 mt-2 text-red-600">
                                    <span>Total Deductions</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payslip.deductions + payslip.tax)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Net Pay */}
                    <div className="bg-muted/50 p-4 rounded-lg flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-muted-foreground">NET PAY</span>
                            <span className="text-xs text-muted-foreground">(Gross Earnings - Total Deductions)</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(payslip.netSalary)}
                        </div>
                    </div>

                    <div className="text-xs text-center text-muted-foreground pt-8">
                        This is a computer-generated document and does not require a signature.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
