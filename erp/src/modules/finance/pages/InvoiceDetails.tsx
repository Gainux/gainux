import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { invoiceService } from "../services/invoiceService";
import InvoicePreview from "../components/InvoicePreview";

export default function InvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await invoiceService.getInvoiceById(id);
            setInvoice(data);
        } catch (err: any) {
            console.error("Error fetching invoice:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await invoiceService.deleteInvoice(id);
            navigate("/finance/invoices");
        } catch (err: any) {
            console.error("Error deleting invoice:", err);
            alert("Failed to delete invoice");
        }
    };

    const handleStatusChange = async (status: string) => {
        if (!id) return;
        try {
            await invoiceService.updateInvoiceStatus(id, status as any);
            fetchInvoice();
        } catch (err: any) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current || !invoice) return;

        try {
            setDownloading(true);

            // Create a temporary iframe to isolate the PDF generation from app styles
            const iframe = document.createElement('iframe');
            iframe.style.visibility = 'hidden';
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            iframe.style.top = '-9999px';
            iframe.style.width = '210mm'; // A4 width
            iframe.style.height = '297mm'; // A4 height
            document.body.appendChild(iframe);

            // Write the invoice content to the iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) {
                document.body.removeChild(iframe);
                throw new Error("Could not create iframe document");
            }

            // Clean the HTML of any class attributes to prevent potential lookups
            const cleanHtml = invoiceRef.current.outerHTML.replace(/class="[^"]*"/g, '').replace(/className="[^"]*"/g, '');

            // Copy the content
            iframeDoc.open();
            iframeDoc.write('<html><head><style>body { margin: 0; padding: 0; background: white; }</style></head><body>');
            iframeDoc.write(cleanHtml);
            iframeDoc.write('</body></html>');
            iframeDoc.close();

            // Wait a moment for the iframe to render
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate canvas from iframe body
            const canvas = await html2canvas(iframeDoc.body, {
                scale: 2,
                useCORS: true,
                window: iframe.contentWindow as Window, // Vital: Force html2canvas to use the iframe's window context
                logging: false,
                backgroundColor: '#ffffff'
            } as any);

            // Create PDF
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${invoice.invoiceNumber}.pdf`);

            // Clean up
            document.body.removeChild(iframe);

        } catch (err: any) {
            console.error("Error generating PDF:", err);
            alert("Failed to generate PDF: " + err.message);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertDescription>{error || "Invoice not found"}</AlertDescription>
                </Alert>
                <Button className="mt-4" onClick={() => navigate("/finance/invoices")}>
                    Back to Invoices
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/finance/invoices")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h2>
                        <p className="text-muted-foreground">
                            {invoice.customer?.name || "No customer"} {invoice.customer?.company && `• ${invoice.customer.company}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPDF} disabled={downloading}>
                        <Download className="h-4 w-4 mr-2" />
                        {downloading ? "Generating..." : "Download PDF"}
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/finance/invoices/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Invoice Preview */}
                <div className="flex justify-center" ref={invoiceRef}>
                    <InvoicePreview invoice={invoice} />
                </div>

                {/* Action Buttons */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {invoice.status === 'draft' && (
                            <Button className="w-full" onClick={() => handleStatusChange('sent')}>
                                Mark as Sent
                            </Button>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                            <Button className="w-full" onClick={() => handleStatusChange('paid')}>
                                Mark as Paid
                            </Button>
                        )}
                        {invoice.status !== 'cancelled' && (
                            <Button className="w-full" variant="outline" onClick={() => handleStatusChange('cancelled')}>
                                Cancel Invoice
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
