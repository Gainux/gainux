import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { employeeService } from "../services/employeeService";
import { useAuth } from "@/context/AuthContext";
import type { Department, Designation } from "../types";
import { toast } from "sonner";

export default function OrgStructurePage() {
    const { profile } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);

    // Department dialog
    const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
    const [deptName, setDeptName] = useState('');
    const [deptDescription, setDeptDescription] = useState('');

    // Designation dialog
    const [isDesigDialogOpen, setIsDesigDialogOpen] = useState(false);
    const [desigTitle, setDesigTitle] = useState('');
    const [desigDescription, setDesigDescription] = useState('');

    useEffect(() => {
        if (profile?.org_id) {
            loadData();
        }
    }, [profile?.org_id]);

    const loadData = async () => {
        if (!profile?.org_id) return;

        try {
            setLoading(true);
            const [depts, desigs] = await Promise.all([
                employeeService.getDepartments(profile.org_id),
                employeeService.getDesignations(profile.org_id)
            ]);
            setDepartments(depts);
            setDesignations(desigs);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load organizational structure");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDepartment = async () => {
        if (!profile?.org_id || !deptName.trim()) {
            toast.error("Please enter a department name");
            return;
        }

        try {
            await employeeService.createDepartment(profile.org_id, deptName, deptDescription);
            toast.success("Department created");
            setIsDeptDialogOpen(false);
            setDeptName('');
            setDeptDescription('');
            loadData();
        } catch (error) {
            console.error("Failed to create department", error);
            toast.error("Failed to create department");
        }
    };

    const handleCreateDesignation = async () => {
        if (!profile?.org_id || !desigTitle.trim()) {
            toast.error("Please enter a designation title");
            return;
        }

        try {
            await employeeService.createDesignation(profile.org_id, desigTitle, desigDescription);
            toast.success("Designation created");
            setIsDesigDialogOpen(false);
            setDesigTitle('');
            setDesigDescription('');
            loadData();
        } catch (error) {
            console.error("Failed to create designation", error);
            toast.error("Failed to create designation");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Organization Structure</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Departments Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Departments</CardTitle>
                                <CardDescription>Manage organizational departments</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsDeptDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Department
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : departments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                                No departments found. Create your first department.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        departments.map((dept) => (
                                            <TableRow key={dept.id}>
                                                <TableCell className="font-medium">{dept.name}</TableCell>
                                                <TableCell>{dept.description || '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Designations Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Designations</CardTitle>
                                <CardDescription>Manage job titles and positions</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsDesigDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Designation
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : designations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                                No designations found. Create your first designation.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        designations.map((desig) => (
                                            <TableRow key={desig.id}>
                                                <TableCell className="font-medium">{desig.title}</TableCell>
                                                <TableCell>{desig.description || '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Department Dialog */}
            <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Department</DialogTitle>
                        <DialogDescription>
                            Create a new department for your organization
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="dept-name">Department Name *</Label>
                            <Input
                                id="dept-name"
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                placeholder="e.g. Engineering, Sales, HR"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dept-description">Description (Optional)</Label>
                            <Input
                                id="dept-description"
                                value={deptDescription}
                                onChange={(e) => setDeptDescription(e.target.value)}
                                placeholder="Brief description of the department"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateDepartment}>Create Department</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Designation Dialog */}
            <Dialog open={isDesigDialogOpen} onOpenChange={setIsDesigDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Designation</DialogTitle>
                        <DialogDescription>
                            Create a new job title or position
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="desig-title">Designation Title *</Label>
                            <Input
                                id="desig-title"
                                value={desigTitle}
                                onChange={(e) => setDesigTitle(e.target.value)}
                                placeholder="e.g. Software Engineer, Manager"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desig-description">Description (Optional)</Label>
                            <Input
                                id="desig-description"
                                value={desigDescription}
                                onChange={(e) => setDesigDescription(e.target.value)}
                                placeholder="Brief description of the role"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDesigDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateDesignation}>Create Designation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
