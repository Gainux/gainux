import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quote, SalesOrder } from "../types";

import { supabase } from "@/lib/supabase";
import { companyService } from "@/modules/system/services/companyService";

export const pdfService = {
    async generateQuotePDF(quote: Quote) {
        const doc = new jsPDF();

        // Fetch Organization Details
        let orgData: any = { name: "Organization Name" };
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
                if (profile?.org_id) {
                    orgData = await companyService.getOrganization(profile.org_id);
                }
            }
        } catch (e) {
            console.error("Failed to load organization details for PDF", e);
        }

        const orgName = orgData.name || "Organization Name";
        const addr = orgData.address || {};

        // Currency Formatter
        const formatMoney = (amount: number) => {
            const symbol = orgData.settings?.currency_symbol || '$';
            const val = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return `${symbol} ${val}`;
        };

        // Letterhead / Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(orgName, 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let headerY = 26;

        // Address Line 1 (Street)
        if (addr.street) {
            doc.text(addr.street, 14, headerY);
            headerY += 5;
        }

        // Address Line 2 (City, State, Pin)
        if (addr.city || addr.state || addr.pincode) {
            const parts = [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
            doc.text(parts, 14, headerY);
            headerY += 5;
        }

        // Contacts
        if (addr.email || addr.phone) {
            const parts = [addr.email, addr.phone].filter(Boolean).join(" | ");
            doc.text(parts, 14, headerY);
            headerY += 5;
        }

        // GSTIN
        if (addr.gstin) {
            doc.text(`GSTIN: ${addr.gstin}`, 14, headerY);
        }

        // Title & Meta (Right aligned)
        doc.setFontSize(26);
        doc.setTextColor(150); // Light Grey
        doc.text("QUOTATION", 130, 25);
        doc.setTextColor(0); // Reset

        doc.setFontSize(10);
        doc.text(`Quote #: ${quote.quoteNumber}`, 130, 35);
        doc.text(`Date: ${quote.issueDate ? new Date(quote.issueDate).toLocaleDateString() : '-'}`, 130, 40);
        if (quote.validUntil) {
            doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 130, 45);
        }

        // Company / Customer Info
        const customerY = Math.max(headerY + 15, 60);
        doc.text("To:", 14, customerY);
        doc.setFontSize(12);
        doc.setFont("helvetica", 'bold');
        doc.text(quote.company?.name || "Valued Customer", 14, customerY + 6);
        doc.setFontSize(10);
        doc.setFont("helvetica", 'normal');
        if (quote.contact) {
            doc.text(`Attn: ${quote.contact.firstName} ${quote.contact.lastName}`, 14, customerY + 11);
        }

        // Scope of Work
        let startY = customerY + 25;
        if (quote.scopeOfWork) {
            doc.setFontSize(14);
            doc.text("Scope of Work", 14, startY);
            doc.setFontSize(10);
            const splitScope = doc.splitTextToSize(quote.scopeOfWork, 180);
            doc.text(splitScope, 14, startY + 7);
            startY += (splitScope.length * 5) + 15;
        }

        // Table
        const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
        const tableRows = quote.items.map(item => [
            item.description,
            item.quantity,
            formatMoney(item.unitPrice),
            formatMoney(item.total)
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: startY,
        });

        // Totals
        // @ts-ignore
        let finalY = doc.lastAutoTable.finalY + 10;

        if (quote.taxRate) {
            doc.text(`Subtotal: ${formatMoney(quote.totalAmount)}`, 14, finalY);
            const taxAmount = quote.totalAmount * (quote.taxRate / 100);
            doc.text(`Tax (${quote.taxRate}%): ${formatMoney(taxAmount)}`, 14, finalY + 5);
            doc.setFontSize(12);
            doc.text(`Total: ${formatMoney(quote.totalAmount + taxAmount)}`, 14, finalY + 12);
            finalY += 20;
        } else {
            doc.text(`Total Amount: ${formatMoney(quote.totalAmount)}`, 14, finalY);
            finalY += 10;
        }

        // Terms & Conditions
        if (quote.paymentTerms || quote.terms) {
            doc.setFontSize(12);
            doc.text("Terms and Conditions", 14, finalY + 10);
            doc.setFontSize(10);

            let termY = finalY + 17;
            if (quote.paymentTerms) {
                doc.setFont("helvetica", 'bold');
                doc.text("Payment Terms:", 14, termY);
                doc.setFont("helvetica", 'normal');
                const splitPayment = doc.splitTextToSize(quote.paymentTerms, 180);
                doc.text(splitPayment, 14, termY + 5);
                termY += (splitPayment.length * 5) + 10;
            }

            if (quote.terms) {
                const splitTerms = doc.splitTextToSize(quote.terms, 180);
                doc.text(splitTerms, 14, termY);
            }
        }

        // Footer
        doc.setFontSize(8);
        doc.text("Thank you for your business!", 14, 280);

        doc.save(`Quote_${quote.quoteNumber}.pdf`);
    },

    async generateSalesOrderPDF(order: SalesOrder) {
        const doc = new jsPDF();

        // Fetch Organization Details
        let orgData: any = { name: "Organization Name" };
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
                if (profile?.org_id) {
                    orgData = await companyService.getOrganization(profile.org_id);
                }
            }
        } catch (e) {
            console.error("Failed to load organization details for PDF", e);
        }

        const orgName = orgData.name || "Organization Name";
        const addr = orgData.address || {};

        // Currency Formatter
        const formatMoney = (amount: number) => {
            const symbol = orgData.settings?.currency_symbol || '$';
            const val = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
            return `${symbol} ${val}`;
        };

        // Letterhead
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(orgName, 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let headerY = 26;

        if (addr.street) {
            doc.text(addr.street, 14, headerY);
            headerY += 5;
        }

        if (addr.city || addr.state || addr.pincode) {
            const parts = [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
            doc.text(parts, 14, headerY);
            headerY += 5;
        }

        if (addr.email || addr.phone) {
            const parts = [addr.email, addr.phone].filter(Boolean).join(" | ");
            doc.text(parts, 14, headerY);
            headerY += 5;
        }

        if (addr.gstin) {
            doc.text(`GSTIN: ${addr.gstin}`, 14, headerY);
        }

        // Title
        doc.setFontSize(26);
        doc.setTextColor(150);
        doc.text("SALES ORDER", 130, 25);
        doc.setTextColor(0);

        doc.setFontSize(10);
        doc.text(`Order #: ${order.orderNumber}`, 130, 35);
        doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 130, 40);

        // Bill To
        const customerY = Math.max(headerY + 15, 60);
        doc.text("Bill To:", 14, customerY);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(order.company?.name || "Valued Customer", 14, customerY + 6);
        doc.setFont('helvetica', 'normal');

        // Table
        const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
        const tableRows = order.items.map(item => [
            item.description,
            item.quantity,
            formatMoney(item.unitPrice),
            formatMoney(item.total)
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: customerY + 15,
        });

        // Totals
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total Amount: ${formatMoney(order.totalAmount)}`, 14, finalY);

        // Footer
        doc.setFontSize(8);
        doc.text("Thank you for your order!", 14, finalY + 20);

        doc.save(`SalesOrder_${order.orderNumber}.pdf`);
    }
};
