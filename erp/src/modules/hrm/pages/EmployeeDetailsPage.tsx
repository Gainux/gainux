import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Building, Calendar, DollarSign, User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { employeeService } from "../services/employeeService";
import { payrollService } from "../services/payrollService";
import { NewEmployeeForm } from "../components/NewEmployeeForm";
import type { Employee, SalaryStructure } from "../types";

export default function EmployeeDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [salaryStructure, setSalaryStructure] = useState<SalaryStructure | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id && id !== 'new') {
            loadEmployee(id);
        } else if (id === 'new') {
            setLoading(false);
        }
    }, [id]);

    const loadEmployee = async (employeeId: string) => {
        try {
            setLoading(true);
            const [empData, salaryData] = await Promise.all([
                employeeService.getEmployeeById(employeeId),
                payrollService.getSalaryStructure(employeeId)
            ]);
            setEmployee(empData);
            setSalaryStructure(salaryData);
        } catch (error) {
            console.error("Failed to load employee", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex-1 p-4 md:p-8 flex justify-center items-center">Loading...</div>;
    }

    if (id === 'new') {
        return <NewEmployeeForm />;
    }

    if (isEditing && id) {
        return (
            <NewEmployeeForm
                employeeId={id}
                onSuccess={() => {
                    setIsEditing(false);
                    loadEmployee(id);
                }}
            />
        );
    }

    if (!employee) {
        return <div className="flex-1 p-4 md:p-8 flex justify-center items-center">Employee not found</div>;
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            active: "bg-green-100 text-green-800",
            on_leave: "bg-yellow-100 text-yellow-800",
            terminated: "bg-red-100 text-red-800",
        };
        return (
            <Badge className={styles[status as keyof typeof styles] || ""} variant="secondary">
                {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Badge>
        );
    };

    // Calculate annual salary (Basic + HRA + Allowances) * 12
    const calculateAnnualSalary = () => {
        if (!salaryStructure) return 0;
        const monthlyTotal =
            (salaryStructure.basicSalary || 0) +
            (salaryStructure.hra || 0) +
            (salaryStructure.allowances || 0);
        return monthlyTotal * 12;
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/hrm/employees')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Employee Profile</h2>
                </div>
                <Button onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Main Profile Card */}
                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="h-10 w-10 text-slate-500" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{employee.firstName} {employee.lastName}</CardTitle>
                            <CardDescription className="text-base">{employee.designation?.title || 'No Designation'}</CardDescription>
                            <div className="pt-2">
                                {getStatusBadge(employee.status)}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <Separator />

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{employee.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{employee.phone || 'N/A'}</span>
                                </div>
                                {/* Address removed as it is not in the schema yet */}
                            </div>
                        </div>

                        <Separator />

                        {/* Additional Info */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Other Details</h3>
                            <div className="grid grid-cols-1 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Employee Code:</span> <span className="font-medium">{employee.employeeCode}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Manager:</span> <span className="font-medium">N/A</span>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Employment Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building className="h-4 w-4" />
                                Department
                            </div>
                            <div className="font-medium">{employee.department?.name || 'Unassigned'}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Date of Joining
                            </div>
                            <div className="font-medium">
                                {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                Annual Salary (Est.)
                            </div>
                            <div className="font-medium">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(calculateAnnualSalary())}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Base: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(salaryStructure?.basicSalary || 0)} / mo
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
