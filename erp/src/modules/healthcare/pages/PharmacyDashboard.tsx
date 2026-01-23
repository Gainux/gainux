
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { healthcareService } from "../services/healthcareService";
import type { Prescription } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PharmacyDashboard() {
    const { profile } = useAuth();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.org_id) loadPrescriptions();
    }, [profile?.org_id]);

    const loadPrescriptions = async () => {
        try {
            setLoading(true);
            const data = await healthcareService.getPrescriptions(profile?.org_id || '', 'pending_pharmacy');
            setPrescriptions(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pharmacy queue");
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async (id: string) => {
        try {
            await healthcareService.dispensePrescription(id);
            toast.success("Prescription dispensed");
            loadPrescriptions(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to dispense");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Pharmacy Queue</h2>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : prescriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No pending prescriptions.
                                </TableCell>
                            </TableRow>
                        ) : (
                            prescriptions.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{format(new Date(p.created_at), 'MMM dd, HH:mm')}</TableCell>
                                    <TableCell className="font-medium">
                                        {p.patient?.first_name} {p.patient?.last_name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {p.items?.map((item, idx) => (
                                                <div key={idx} className="text-sm">
                                                    {item.quantity}x {item.item?.name}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-orange-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" onClick={() => handleDispense(p.id)}>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Dispense
                                        </Button>
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
