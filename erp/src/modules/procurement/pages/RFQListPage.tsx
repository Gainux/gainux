
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { procurementService } from "../services/procurementService";
import type { RFQ } from "../types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function RFQListPage() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (profile?.org_id) loadRfqs();
    }, [profile?.org_id]);

    const loadRfqs = async () => {
        try {
            setLoading(true);
            const data = await procurementService.getRFQs(profile?.org_id || '');
            setRfqs(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load RFQs");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return "bg-green-500 hover:bg-green-600";
            case 'awarded': return "bg-blue-500 hover:bg-blue-600";
            case 'closed': return "bg-gray-500 hover:bg-gray-600";
            default: return "bg-yellow-500 hover:bg-yellow-600"; // draft
        }
    };

    const filteredRfqs = rfqs.filter(r =>
        r.rfq_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Requests for Quotation</h2>
                <Button onClick={() => navigate("/procurement/rfq/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Create RFQ
                </Button>
            </div>

            <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search RFQs..."
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
                            <TableHead>RFQ Number</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Created Date</TableHead>
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
                        ) : filteredRfqs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No RFQs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRfqs.map((rfq) => (
                                <TableRow key={rfq.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/procurement/rfq/${rfq.id}`)}>
                                    <TableCell className="font-medium">{rfq.rfq_number}</TableCell>
                                    <TableCell>{rfq.title || '-'}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(rfq.status)}>
                                            {rfq.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {rfq.deadline ? format(new Date(rfq.deadline), 'MMM dd, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(rfq.created_at), 'MMM dd, yyyy')}
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
