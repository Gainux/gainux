
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Activity,
    Search,
    TrendingUp,
    Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { employeeService } from "../../services/employeeService";
// We will reuse performanceService to get stats per employee if needed, 
// but for list view we might just show static data or fetch on demand to avoid N+1 for now.
// For V1, we will just list employees and show a "View" button that could lead to their dashboard.
import type { Employee } from "../../types";

interface TeamPerformancePageProps {
    selectedMonth: Date;
}

export default function TeamPerformancePage({ selectedMonth }: TeamPerformancePageProps) {
    const { profile } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadData = async () => {
            if (!profile?.org_id) return;
            try {
                const data = await employeeService.getEmployees(profile.org_id);
                setEmployees(data);
            } catch (error) {
                console.error("Failed to load team data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [profile]);

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-4">Loading team data...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employees.length}</div>
                        <p className="text-xs text-muted-foreground">Active team members</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reviews Pending</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">For {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Average</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">- / 5</div>
                        <p className="text-xs text-muted-foreground">Overall performance</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Team Members</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    className="pl-8 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-4 font-medium">Employee</th>
                                    <th className="p-4 font-medium">Department</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            No employees found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="border-t hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                                                <div className="text-xs text-muted-foreground">{emp.email}</div>
                                            </td>
                                            <td className="p-4">
                                                {emp.department?.name || "-"}
                                            </td>
                                            <td className="p-4">
                                                {emp.designation?.title || "-"}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                                                    {emp.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link to={`/hrm/performance/employee/${emp.id}`}>View Stats</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
