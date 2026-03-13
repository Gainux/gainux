import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { employeeService } from "../services/employeeService";
import { useAuth } from "@/context/AuthContext";
import type { Employee, Department } from "../types";
import { toast } from "sonner";

export default function EmployeeList() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [loading, setLoading] = useState(true);

    // Filters
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (profile?.org_id) {
            loadData();
        }
    }, [profile?.org_id]);

    const loadData = async () => {
        if (!profile?.org_id) return;

        try {
            setLoading(true);
            const [employeesData, departmentsData] = await Promise.all([
                employeeService.getEmployees(profile.org_id),
                employeeService.getDepartments(profile.org_id)
            ]);

            setEmployees(employeesData);
            setDepartments(departmentsData);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this employee?")) {
            try {
                await employeeService.deleteEmployee(id);
                toast.success("Employee deleted");
                loadData();
            } catch (error) {
                console.error("Failed to delete employee", error);
                toast.error("Failed to delete employee");
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: "bg-green-100 text-green-800 hover:bg-green-100",
            inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
            terminated: "bg-red-100 text-red-800 hover:bg-red-100",
        };
        return (
            <Badge className={styles[status as keyof typeof styles] || ""} variant="outline">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = (emp.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (emp.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (emp.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (emp.employeeCode?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesDept = departmentFilter === 'all' || emp.departmentId === departmentFilter;
        const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

        return matchesSearch && matchesDept && matchesStatus;
    });


    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">Employees</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => navigate('/hrm/employees/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-2 py-4">
                <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full">
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-mono text-sm">{employee.employeeCode}</TableCell>
                                    <TableCell className="font-medium">
                                        <button
                                            onClick={() => navigate(`/hrm/employees/${employee.id}`)}
                                            className="hover:underline text-left"
                                        >
                                            {employee.firstName} {employee.lastName}
                                        </button>
                                    </TableCell>
                                    <TableCell>{employee.designation?.title || '-'}</TableCell>
                                    <TableCell>{employee.department?.name || '-'}</TableCell>
                                    <TableCell>{employee.email}</TableCell>
                                    <TableCell>{employee.phone || '-'}</TableCell>
                                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => navigate(`/hrm/employees/${employee.id}`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(employee.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
