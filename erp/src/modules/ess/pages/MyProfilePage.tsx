import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export default function MyProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<any>(null);

    useEffect(() => {
        if (user?.id) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('employees')
                .select(`
                    *,
                    department:departments(name),
                    designation:designations(title)
                `)
                .eq('user_id', user?.id)
                .maybeSingle();

            if (error) console.error("Error fetching profile:", error);
            if (data) setEmployee(data);
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <User className="h-12 w-12 mb-4 opacity-50" />
                <p>No employee profile found.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 pt-6 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <div className="text-lg font-semibold flex items-center gap-2">
                                {employee.firstName} {employee.lastName}
                                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                                    {employee.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Employee Code</label>
                            <div className="text-lg">{employee.employeeCode || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {employee.email}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {employee.phone || '-'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Work Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Department</label>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                {employee.department?.name || '-'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Designation</label>
                            <div className="font-medium">{employee.designation?.title || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                            <div className="capitalize">{employee.employmentType || '-'}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Date of Joining</label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {employee.dateOfJoining ? format(new Date(employee.dateOfJoining), 'PPP') : '-'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact & Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                <span className="whitespace-pre-wrap">{employee.address || '-'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
