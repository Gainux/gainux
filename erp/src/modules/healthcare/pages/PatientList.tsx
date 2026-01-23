
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { healthcareService } from "../services/healthcareService";
import type { Patient } from "../types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PatientList() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (profile?.org_id) loadPatients();
    }, [profile?.org_id]);

    const loadPatients = async () => {
        try {
            setLoading(true);
            const data = await healthcareService.getPatients(profile?.org_id || '');
            setPatients(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load patients");
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contact_number?.includes(searchQuery)
    );

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
                <Button onClick={() => navigate("/healthcare/patients/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Patient
                </Button>
            </div>

            <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>DOB (Age)</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Last Visit</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredPatients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No patients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPatients.map((patient) => (
                                <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/healthcare/patients/${patient.id}`)}>
                                    <TableCell>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {patient.first_name[0]}{patient.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {patient.first_name} {patient.last_name}
                                    </TableCell>
                                    <TableCell className="capitalize">{patient.gender || '-'}</TableCell>
                                    <TableCell>
                                        {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM dd, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>{patient.contact_number || '-'}</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">View</Button>
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
