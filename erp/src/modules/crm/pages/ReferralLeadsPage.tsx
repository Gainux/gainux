/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function ReferralLeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeads();
    }, []);

    async function loadLeads() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error: any) {
            toast.error("Failed to load leads: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', leadId);

            if (error) throw error;

            setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
            toast.success("Lead status updated");
        } catch (error: any) {
            toast.error("Failed to update status: " + error.message);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new': return "secondary";
            case 'contacted': return "default";
            case 'negotiation': return "default";
            case 'won':
            case 'qualified': return "default";
            case 'lost': return "destructive";
            default: return "outline";
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Lead Management</h2>
                <p className="text-muted-foreground">Sales Admin view of all submitted leads across the platform.</p>
            </div>

            <div className="bg-white border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Prospect</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Budget/Service</TableHead>
                            <TableHead>Source (Referrer)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[150px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(lead.created_at), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{lead.first_name} {lead.last_name}</div>
                                        <div className="text-sm text-muted-foreground">{lead.company_name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{lead.email}</div>
                                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        {/* Parsing the notes field which we mocked earlier */}
                                        <div className="text-sm whitespace-pre-wrap line-clamp-2 max-w-xs" title={lead.notes}>
                                            {lead.notes}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{lead.source}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(lead.status)}>
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={lead.status}
                                            onValueChange={(val: any) => handleStatusChange(lead.id, val)}
                                        >
                                            <SelectTrigger className="w-[140px] h-8">
                                                <SelectValue placeholder="Update Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="contacted">Contacted</SelectItem>
                                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                                <SelectItem value="won">Won / Converted</SelectItem>
                                                <SelectItem value="lost">Lost</SelectItem>
                                            </SelectContent>
                                        </Select>
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
