import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { invoiceService } from "../services/invoiceService";
import type { Invoice } from "../types";

export default function InvoiceList() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const orgId = profile?.org_id;

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, [orgId]);

    const fetchInvoices = async () => {
        try {
            if (!orgId) return;
            setLoading(true);
            const data = await invoiceService.getInvoices(orgId);
            setInvoices(data);
        } catch (err: any) {
            console.error("Error fetching invoices:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await invoiceService.deleteInvoice(id);
            setInvoices(invoices.filter(inv => inv.id !== id));
        } catch (err: any) {
            console.error("Error deleting invoice:", err);
            alert("Failed to delete invoice");
        }
    };

    const getStatusBadge = (status: Invoice['status']) => {
        const variants = {
            draft: 'secondary',
            sent: 'default',
            paid: 'default',
            overdue: 'destructive',
            cancelled: 'secondary'
        } as const;

        return <Badge variant={variants[status] as any} className="capitalize">{status}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                <Button onClick={() => navigate("/finance/invoices/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No invoices found.</p>
                            <Button className="mt-4" onClick={() => navigate("/finance/invoices/create")}>
                                Create your first invoice
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Issue Date</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                            <TableCell>{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</TableCell>
                                            <TableCell>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(invoice.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
