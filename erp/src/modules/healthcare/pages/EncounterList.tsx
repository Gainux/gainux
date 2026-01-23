
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { healthcareService } from "../services/healthcareService";
import type { ClinicalEncounter } from "../types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function EncounterList() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [encounters, setEncounters] = useState<ClinicalEncounter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (profile?.org_id) loadEncounters();
    }, [profile?.org_id]);

    const loadEncounters = async () => {
        try {
            setLoading(true);
            const data = await healthcareService.getEncounters(profile?.org_id || '');
            setEncounters(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return "bg-blue-500";
            case 'in-progress': return "bg-yellow-500";
            case 'completed': return "bg-green-500";
            case 'cancelled': return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const filteredEncounters = encounters.filter(e =>
        e.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Appointments & Encounters</h2>
                {/* 
                    Usually appointments are created from a patient context, 
                    but we could allow creating a new encounter and selecting a patient. 
                    For now, navigating to patient list to start encounter is cleaner, 
                    or we need an encounter creation page that allows patient selection. 
                    Given existing EncounterDetails requires patient_id for 'new', 
                    let's redirect to Patient List with a hint or just navigate to generic new if handled.
                    EncounterDetails handles 'new' but needs patient connection.
                    Let's just navigate to /healthcare/patients for now if they want to add.
                    OR, ideally, we create a flow to select patient first.
                */}
                <Button onClick={() => navigate("/healthcare/encounters/new")}>
                    <Plus className="mr-2 h-4 w-4" /> New Appointment
                </Button>
            </div>

            <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by patient name..."
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
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Diagnosis</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredEncounters.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No appointments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEncounters.map((encounter) => (
                                <TableRow key={encounter.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/healthcare/encounters/${encounter.id}`)}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {encounter.encounter_date ? format(new Date(encounter.encounter_date), 'MMM dd, HH:mm') : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {encounter.patient?.first_name} {encounter.patient?.last_name}
                                    </TableCell>
                                    <TableCell className="capitalize">{encounter.type.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(encounter.status)}>
                                            {encounter.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {encounter.diagnosis || '-'}
                                    </TableCell>
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
