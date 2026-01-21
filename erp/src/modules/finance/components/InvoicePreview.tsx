import { useState, useEffect } from "react";
import { companyService } from "@/modules/system/services/companyService";
import type { Organization } from "@/modules/system/types";

interface InvoicePreviewProps {
    invoice: any;
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
    const [org, setOrg] = useState<Organization | null>(null);

    useEffect(() => {
        if (invoice?.org_id) {
            loadOrg(invoice.org_id);
        }
    }, [invoice]);

    const loadOrg = async (orgId: string) => {
        try {
            const orgData = await companyService.getOrganization(orgId);
            setOrg(orgData);
        } catch (err) {
            console.error("Error loading organization settings:", err);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const orgAddress = org?.address || {};

    return (
        <div style={{
            width: '100%',
            margin: '0 auto',
            aspectRatio: '210/297',
            maxWidth: '210mm',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '0.5rem',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif'
        }}>
            {/* A4 Paper Content */}
            <div style={{
                padding: '3rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '297mm',
                backgroundColor: '#ffffff',
                color: '#000000',
                boxSizing: 'border-box'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: '700', margin: 0, color: '#111827' }}>INVOICE</h1>
                            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#6B7280', margin: 0 }}>{invoice.invoiceNumber}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#111827' }}>{org?.name || 'Gainux'}</h2>
                            {orgAddress.street && (
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>{orgAddress.street}</p>
                            )}
                            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                                {orgAddress.city || ''}{orgAddress.city && orgAddress.state ? ', ' : ''}{orgAddress.state || ''}{(orgAddress.city || orgAddress.state) && orgAddress.pincode ? ' - ' : ''}{orgAddress.pincode || ''}
                            </p>
                            {orgAddress.phone && (
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>Phone: {orgAddress.phone}</p>
                            )}
                            {orgAddress.email && (
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>{orgAddress.email}</p>
                            )}
                            {invoice.taxRate > 0 && orgAddress.gstin && (
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>GSTIN: {orgAddress.gstin}</p>
                            )}
                        </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '16px 0' }} />

                    {/* Bill To & Invoice Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#6B7280', margin: 0 }}>Bill To</h3>
                            <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{invoice.customer?.name || "Customer Name"}</p>
                            {/* Assuming invoice.customer refers to the 'companies' row which has address column */}
                            {invoice.customer?.address && (
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, whiteSpace: 'pre-line' }}>{invoice.customer.address}</p>
                            )}
                            {invoice.customer?.email && (
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>{invoice.customer.email}</p>
                            )}
                            {invoice.customer?.phone && (
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>{invoice.customer.phone}</p>
                            )}
                            {invoice.customer?.website && (
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>{invoice.customer.website}</p>
                            )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <span style={{ color: '#6B7280' }}>Issue Date:</span>
                                <span style={{ fontWeight: '500', color: '#111827' }}>{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</span>
                                <span style={{ color: '#6B7280' }}>Due Date:</span>
                                <span style={{ fontWeight: '500', color: '#111827' }}>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span>
                                <span style={{ color: '#6B7280' }}>Status:</span>
                                <span style={{ fontWeight: '500', color: '#111827', textTransform: 'capitalize' }}>{invoice.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div style={{ flex: '1 1 0%', marginBottom: '2rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #D1D5DB' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#374151' }}>Description</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', width: '5rem', color: '#374151' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', width: '8rem', color: '#374151' }}>Unit Price</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', width: '8rem', color: '#374151' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item: any, index: number) => (
                                <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: '#111827' }}>{item.description}</td>
                                    <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', textAlign: 'right', color: '#111827' }}>{item.quantity}</td>
                                    <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', textAlign: 'right', color: '#111827' }}>{formatCurrency(item.unitPrice)}</td>
                                    <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', textAlign: 'right', fontWeight: '500', color: '#111827' }}>{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '20rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6B7280' }}>Subtotal:</span>
                                    <span style={{ fontWeight: '500', color: '#111827' }}>{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                {invoice.taxRate > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#6B7280' }}>GST ({invoice.taxRate}%):</span>
                                        <span style={{ fontWeight: '500', color: '#111827' }}>{formatCurrency(invoice.taxAmount)}</span>
                                    </div>
                                )}
                                <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: '700' }}>
                                    <span style={{ color: '#111827' }}>Total:</span>
                                    <span style={{ color: '#111827' }}>{formatCurrency(invoice.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#374151', margin: 0 }}>Notes</h4>
                            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>{invoice.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ marginTop: '3rem', paddingTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #E5E7EB' }}>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
