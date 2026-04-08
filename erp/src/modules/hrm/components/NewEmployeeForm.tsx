import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { employeeService } from "../services/employeeService";
import { payrollService } from "../services/payrollService";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Department, Designation } from "../types";
import { toast } from "sonner";

export function NewEmployeeForm({ employeeId, onSuccess }: { employeeId?: string, onSuccess?: () => void }) {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);

    const [formData, setFormData] = useState({
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        departmentId: '',
        designationId: '',
        employmentType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'intern',
        status: 'active' as 'active' | 'inactive' | 'terminated',
    });

    const [salaryDetails, setSalaryDetails] = useState({
        basicSalary: '',
        hra: '',
        allowances: '',
        deductions: ''
    });

    const [createLoginAccount, setCreateLoginAccount] = useState(true);
    const [password, setPassword] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        if (profile?.org_id) {
            loadFormData();
        }
    }, [profile?.org_id]);

    useEffect(() => {
        if (employeeId && profile?.org_id) {
            loadEmployeeData(employeeId);
        }
    }, [employeeId, profile?.org_id]);

    const loadFormData = async () => {
        if (!profile?.org_id) return;

        try {
            const [depts, desigs] = await Promise.all([
                employeeService.getDepartments(profile.org_id),
                employeeService.getDesignations(profile.org_id)
            ]);
            setDepartments(depts);
            setDesignations(desigs);
        } catch (error) {
            console.error("Failed to load form data", error);
            toast.error("Failed to load departments and designations");
        }
    };

    const loadEmployeeData = async (id: string) => {
        try {
            setLoading(true);
            const [employee, salary] = await Promise.all([
                employeeService.getEmployeeById(id),
                payrollService.getSalaryStructure(id)
            ]);

            if (employee) {
                setFormData({
                    employeeCode: employee.employeeCode,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    email: employee.email,
                    phone: employee.phone || '',
                    dateOfBirth: employee.dateOfBirth || '',
                    dateOfJoining: employee.dateOfJoining,
                    departmentId: employee.departmentId || '',
                    designationId: employee.designationId || '',
                    employmentType: employee.employmentType,
                    status: employee.status as any,
                });
                setCurrentUserId(employee.userId || null);
                // If they already have a login, don't check the create box by default
                if (employee.userId) {
                    setCreateLoginAccount(false);
                }
            }

            if (salary) {
                setSalaryDetails({
                    basicSalary: salary.basicSalary.toString(),
                    hra: salary.hra.toString(),
                    allowances: salary.allowances.toString(),
                    deductions: salary.deductions.toString()
                });
            }
        } catch (error) {
            console.error("Failed to load employee data", error);
            toast.error("Failed to load employee details");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLogin = async () => {
        if (!employeeId || !currentUserId) return;

        if (!confirm("Are you sure you want to remove the login access for this employee? They will no longer be able to sign in.")) {
            return;
        }

        try {
            setLoading(true);
            // Updating employee with userId: null will unlink the auth user
            await employeeService.updateEmployee(employeeId, { userId: null } as any);
            setCurrentUserId(null);
            setCreateLoginAccount(true); // Reset to allow creation again
            toast.success("Login access removed successfully");
        } catch (error: any) {
            console.error("Failed to remove login", error);
            toast.error("Failed to remove login access");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profile?.org_id) {
            toast.error("User profile not loaded");
            return;
        }

        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.employeeCode) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (createLoginAccount && !currentUserId && !password) {
            toast.error("Please enter a password for the login account");
            return;
        }

        if (createLoginAccount && !currentUserId && password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            let userId: string | undefined = undefined;

            // Step 1: Create auth user if requested (For new employees OR existing employees without login)
            if (createLoginAccount && !currentUserId) {
                // Use a temporary client to avoid switching the current admin session
                const tempSupabase = createClient(
                    import.meta.env.VITE_SUPABASE_URL,
                    import.meta.env.VITE_SUPABASE_ANON_KEY,
                    {
                        auth: {
                            persistSession: false,
                            autoRefreshToken: false,
                            detectSessionInUrl: false
                        }
                    }
                );

                const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                    email: formData.email,
                    password: password,
                    options: {
                        data: {
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                        }
                    }
                });

                if (authError) throw new Error(`Failed to create login: ${authError.message}`);
                if (!authData.user) throw new Error("Failed to create user");

                userId = authData.user.id;

                // Step 2: Create/Update profile with employee role
                // Use RPC to bypass RLS and ensure org_id is set
                const { error: profileError } = await supabase.rpc('create_employee_profile', {
                    target_id: userId,
                    target_email: formData.email,
                    target_first_name: formData.firstName,
                    target_last_name: formData.lastName,
                    target_org_id: profile.org_id,
                    target_role: 'employee',
                    target_status: 'active'
                });

                if (profileError) {
                    console.error("Profile creation failed:", profileError);
                    throw new Error(`Failed to setup user profile: ${profileError.message}`);
                }
            }

            // Step 3: Create or Update employee record
            const employeeData = {
                ...formData,
                departmentId: formData.departmentId || undefined,
                designationId: formData.designationId || undefined,
                phone: formData.phone || undefined,
                dateOfBirth: formData.dateOfBirth || undefined,
                orgId: profile.org_id,
                ...(userId ? { userId } : {}) // Properly attach new userId if created
            };

            let savedEmployee;

            if (employeeId) {
                savedEmployee = await employeeService.updateEmployee(employeeId, employeeData);
                // Also update local currentUserId if we just added one
                if (userId) setCurrentUserId(userId);
                toast.success("Employee updated successfully");
            } else {
                savedEmployee = await employeeService.createEmployee({ ...employeeData, userId: userId || '' } as any);
                toast.success(createLoginAccount ? "Employee created with login account!" : "Employee created successfully");
            }

            // Step 4: Save Salary Structure (if changed or new)
            // For now, always save if there are values, as setSalaryStructure handles versioning
            if (salaryDetails.basicSalary || salaryDetails.hra || salaryDetails.allowances || salaryDetails.deductions) {
                await payrollService.setSalaryStructure({
                    orgId: profile.org_id,
                    employeeId: savedEmployee.id,
                    basicSalary: Number(salaryDetails.basicSalary) || 0,
                    hra: Number(salaryDetails.hra) || 0,
                    allowances: Number(salaryDetails.allowances) || 0,
                    deductions: Number(salaryDetails.deductions) || 0,
                    effectiveFrom: formData.dateOfJoining || new Date().toISOString()
                });
            }

            if (onSuccess) {
                onSuccess();
            } else if (!employeeId) {
                navigate('/hrm/employees');
            }
        } catch (error: any) {
            console.error("Failed to save employee", error);
            toast.error(error.message || "Failed to save employee");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSalaryChange = (field: string, value: string) => {
        setSalaryDetails(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex-1 p-4 md:p-8">
            <div className="flex items-center space-x-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/hrm/employees')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">
                    {employeeId ? 'Edit Employee' : 'Add New Employee'}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                {employeeId ? 'Update employee details' : 'Basic employee details'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="employeeCode">Employee Code *</Label>
                                    <Input
                                        id="employeeCode"
                                        value={formData.employeeCode}
                                        onChange={(e) => handleChange('employeeCode', e.target.value)}
                                        placeholder="EMP001"
                                        required
                                        disabled={!!employeeId} // Typically shouldn't change employee code
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="employee@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Employment Details</CardTitle>
                            <CardDescription>Job-related information</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                                    <Input
                                        id="dateOfJoining"
                                        type="date"
                                        value={formData.dateOfJoining}
                                        onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employmentType">Employment Type *</Label>
                                    <Select
                                        value={formData.employmentType}
                                        onValueChange={(value) => handleChange('employmentType', value)}
                                    >
                                        <SelectTrigger id="employmentType">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full-time">Full-time</SelectItem>
                                            <SelectItem value="part-time">Part-time</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="intern">Intern</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={formData.departmentId}
                                        onValueChange={(value) => handleChange('departmentId', value)}
                                    >
                                        <SelectTrigger id="department">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="designation">Designation</Label>
                                    <Select
                                        value={formData.designationId}
                                        onValueChange={(value) => handleChange('designationId', value)}
                                    >
                                        <SelectTrigger id="designation">
                                            <SelectValue placeholder="Select designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {designations.map(desig => (
                                                <SelectItem key={desig.id} value={desig.id}>
                                                    {desig.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleChange('status', value)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="terminated">Terminated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Login Account Section */}
                            <div className="space-y-4 pt-4 border-t">
                                {!currentUserId ? (
                                    <>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="createLogin"
                                                checked={createLoginAccount}
                                                onCheckedChange={(checked) => setCreateLoginAccount(checked === true)}
                                            />
                                            <Label htmlFor="createLogin" className="text-sm font-medium cursor-pointer">
                                                Create login account for this employee
                                            </Label>
                                        </div>

                                        {createLoginAccount && (
                                            <div className="space-y-2 ml-6">
                                                <Label htmlFor="password">Password *</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Minimum 6 characters"
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    Employee will receive an email to verify their account. Role will be set to "Employee".
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-md border">
                                        <div className="space-y-1">
                                            <Label className="text-base">Login Account Active</Label>
                                            <p className="text-sm text-muted-foreground">
                                                This employee has an active login account linked.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDeleteLogin}
                                            disabled={loading}
                                        >
                                            Remove Login Access
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Salary Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Salary Information</CardTitle>
                            <CardDescription>Compensation details</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="basicSalary">Basic Salary</Label>
                                    <Input
                                        id="basicSalary"
                                        type="number"
                                        min="0"
                                        value={salaryDetails.basicSalary}
                                        onChange={(e) => handleSalaryChange('basicSalary', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hra">HRA</Label>
                                    <Input
                                        id="hra"
                                        type="number"
                                        min="0"
                                        value={salaryDetails.hra}
                                        onChange={(e) => handleSalaryChange('hra', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="allowances">Allowances</Label>
                                    <Input
                                        id="allowances"
                                        type="number"
                                        min="0"
                                        value={salaryDetails.allowances}
                                        onChange={(e) => handleSalaryChange('allowances', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deductions">Deductions</Label>
                                    <Input
                                        id="deductions"
                                        type="number"
                                        min="0"
                                        value={salaryDetails.deductions}
                                        onChange={(e) => handleSalaryChange('deductions', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/hrm/employees')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (employeeId ? 'Update Employee' : 'Create Employee')}
                        </Button>
                    </div>
                </div>
            </form >
        </div >
    );
}
