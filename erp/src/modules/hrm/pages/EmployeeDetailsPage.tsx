import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Building, Calendar, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { employeeService } from "../services/employeeService";
import type { Employee } from "../types";

export default function EmployeeDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadEmployee(id);
        }
    }, [id]);

    const loadEmployee = async (employeeId: string) => {
        try {
            setLoading(true);
            const data = await employeeService.getEmployeeById(employeeId);
            setEmployee(data);
        } catch (error) {
            console.error("Failed to load employee", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex-1 p-8 flex justify-center items-center">Loading...</div>;
    }

    if (!employee) {
        return <div className="flex-1 p-8 flex justify-center items-center">Employee not found</div>;
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

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/hrm/employees')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Employee Profile</h2>
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
                            <CardDescription className="text-base">{employee.jobTitle}</CardDescription>
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
                                <div className="flex items-center gap-2 text-sm md:col-span-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{employee.address || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Emergency Contact */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                            <div className="text-sm">
                                {employee.emergencyContact ? (
                                    <div className="whitespace-pre-wrap">{employee.emergencyContact}</div>
                                ) : (
                                    <span className="text-muted-foreground">No emergency contact info provided.</span>
                                )}
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
                                Hire Date
                            </div>
                            <div className="font-medium">
                                {new Date(employee.hireDate).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                Annual Salary
                            </div>
                            <div className="font-medium">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(employee.salary)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
