import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { departmentAccessService } from "@/services/departmentAccessService";
import { employeeService } from "@/modules/hrm/services/employeeService";
import type { Department } from "@/modules/hrm/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Available modules in the ERP
const AVAILABLE_MODULES = [
    { id: 'overview', name: 'Overview', description: 'Dashboard and System Overview' },
    { id: 'finance', name: 'Finance & Accounting', description: 'General Ledger, Invoicing, Expenses, Tax, and Banking' },
    { id: 'hrm', name: 'Human Resources (HCM)', description: 'Employee Management, Payroll, Attendance, and Recruitment' },
    { id: 'sales', name: 'Sales & CRM', description: 'Lead Management, Opportunities, Customers, and Sales Orders' },
    { id: 'procurement', name: 'Procurement & Supply Chain', description: 'Vendor Management, Purchase Orders, and Inventory' },
    { id: 'manufacturing', name: 'Manufacturing', description: 'Production Planning, BOM, Shop Floor, and Quality Control' },
    { id: 'projects', name: 'Project Management', description: 'Project Costing, Timesheets, and Resource Allocation' },
    { id: 'assets', name: 'Asset Management (EAM)', description: 'Asset Lifecycle, Maintenance, and Work Orders' },
    { id: 'logistics', name: 'Logistics & Distribution', description: 'Fleet Management, Route Planning, and Shipping' },
    { id: 'quality', name: 'Quality & Compliance', description: 'QMS, Audits, Risk Management, and Compliance' },
    { id: 'analytics', name: 'BI & Analytics', description: 'Advanced Reporting, OLAP, and Predictive Insights' },
];

export default function DepartmentModuleAccessPage() {
    const { profile } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [moduleAccess, setModuleAccess] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile?.org_id) {
            loadDepartments();
        }
    }, [profile?.org_id]);

    useEffect(() => {
        if (selectedDepartmentId && profile?.org_id) {
            loadModuleAccess();
        }
    }, [selectedDepartmentId, profile?.org_id]);

    const loadDepartments = async () => {
        if (!profile?.org_id) return;

        try {
            const depts = await employeeService.getDepartments(profile.org_id);
            setDepartments(depts);
        } catch (error) {
            console.error("Failed to load departments", error);
            toast.error("Failed to load departments");
        }
    };

    const loadModuleAccess = async () => {
        if (!profile?.org_id || !selectedDepartmentId) return;

        setLoading(true);
        try {
            const access = await departmentAccessService.getDepartmentModuleAccess(
                profile.org_id,
                selectedDepartmentId
            );

            const accessMap: Record<string, boolean> = {};
            access.forEach(item => {
                accessMap[item.moduleId] = item.hasAccess;
            });

            setModuleAccess(accessMap);
        } catch (error) {
            console.error("Failed to load module access", error);
            toast.error("Failed to load module access");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (moduleId: string, hasAccess: boolean) => {
        setModuleAccess(prev => ({
            ...prev,
            [moduleId]: hasAccess
        }));
    };

    const handleSave = async () => {
        if (!profile?.org_id || !selectedDepartmentId) return;

        setSaving(true);
        try {
            await departmentAccessService.bulkUpdateDepartmentAccess(
                profile.org_id,
                selectedDepartmentId,
                moduleAccess
            );

            toast.success("Module access updated successfully");
        } catch (error) {
            console.error("Failed to save module access", error);
            toast.error("Failed to save module access");
        } finally {
            setSaving(false);
        }
    };

    const handleEnableAll = () => {
        const allEnabled: Record<string, boolean> = {};
        AVAILABLE_MODULES.forEach(module => {
            allEnabled[module.id] = true;
        });
        setModuleAccess(allEnabled);
    };

    const handleDisableAll = () => {
        const allDisabled: Record<string, boolean> = {};
        AVAILABLE_MODULES.forEach(module => {
            allDisabled[module.id] = false;
        });
        setModuleAccess(allDisabled);
    };

    const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Department Module Access</h2>
                    <p className="text-muted-foreground">
                        Control which modules each department can access
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Department</CardTitle>
                    <CardDescription>
                        Choose a department to manage its module access permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a department" />
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
                </CardContent>
            </Card>

            {selectedDepartmentId && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Module Permissions</CardTitle>
                                <CardDescription>
                                    Configure module access for {selectedDepartment?.name}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleEnableAll}>
                                    Enable All
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDisableAll}>
                                    Disable All
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : (
                            <div className="space-y-4">
                                {AVAILABLE_MODULES.map(module => (
                                    <div
                                        key={module.id}
                                        className="flex items-center justify-between py-3 border-b last:border-0"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">{module.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {module.description}
                                            </div>
                                        </div>
                                        <Switch
                                            checked={moduleAccess[module.id] || false}
                                            onCheckedChange={(checked) => handleToggle(module.id, checked)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedDepartmentId('')}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving || loading}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
