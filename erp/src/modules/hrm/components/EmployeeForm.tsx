import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { employeeService } from "../services/employeeService";
import { Loader2 } from "lucide-react";
import type { Employee, Department } from "../types";

const formSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    hireDate: z.string().min(1, "Hire date is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    departmentId: z.string().optional(),
    salary: z.string().min(1, "Salary is required"), // Handle as string for input
    status: z.enum(['active', 'on_leave', 'terminated', 'inactive']),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
});

interface EmployeeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    employeeToEdit?: Employee | null;
}

import { useAuth } from "@/context/AuthContext";

export default function EmployeeForm({ open, onOpenChange, onSuccess, employeeToEdit }: EmployeeFormProps) {
    const { profile } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            hireDate: new Date().toISOString().split('T')[0],
            jobTitle: "",
            departmentId: "",
            salary: "",
            status: "active",
            address: "",
            emergencyContact: "",
        },
    });

    useEffect(() => {
        loadDepartments();
    }, []);

    useEffect(() => {
        if (employeeToEdit) {
            form.reset({
                firstName: employeeToEdit.firstName,
                lastName: employeeToEdit.lastName,
                email: employeeToEdit.email,
                phone: employeeToEdit.phone || "",
                hireDate: employeeToEdit.hireDate,
                jobTitle: employeeToEdit.jobTitle,
                departmentId: employeeToEdit.departmentId || "",
                salary: employeeToEdit.salary?.toString() || "",
                status: employeeToEdit.status,
                address: employeeToEdit.address || "",
                emergencyContact: employeeToEdit.emergencyContact || "",
            });
        } else {
            form.reset({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                hireDate: new Date().toISOString().split('T')[0],
                jobTitle: "",
                departmentId: "",
                salary: "",
                status: "active",
                address: "",
                emergencyContact: "",
            });
        }
    }, [employeeToEdit, form, open]);

    const loadDepartments = async () => {
        if (!profile?.org_id) return;
        try {
            const data = await employeeService.getDepartments(profile.org_id);
            setDepartments(data);
        } catch (error) {
            console.error("Failed to load departments", error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!profile?.org_id) return;

        try {
            setSubmitting(true);
            const employeeData = {
                ...values,
                salary: parseFloat(values.salary),
                departmentId: (!values.departmentId || values.departmentId === "none") ? undefined : values.departmentId,
                orgId: profile.org_id,
                dateOfJoining: values.hireDate, // Map hireDate to dateOfJoining
                employmentType: 'full-time' as const, // Default for now, could be added to form
                status: values.status as any,
                // userId and employeeCode should be handled by backend or service if not here
                userId: 'temp-user-id', // Placeholder if service doesn't generate it
                employeeCode: 'EMP-' + Math.floor(Math.random() * 10000), // Placeholder
            };

            if (employeeToEdit) {
                await employeeService.updateEmployee(employeeToEdit.id, employeeData);
            } else {
                await employeeService.createEmployee(employeeData as any); // Cast as any if partial mismatch persists but we have basics
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            alert("Failed to save employee");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{employeeToEdit ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="jobTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Software Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="salary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Annual Salary</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="50000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hireDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hire Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="on_leave">On Leave</SelectItem>
                                            <SelectItem value="terminated">Terminated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="123 Main St..." className="resize-none h-20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="emergencyContact"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Emergency Contact</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Name, Relation, Phone..." className="resize-none h-20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {employeeToEdit ? "Update Employee" : "Create Employee"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
