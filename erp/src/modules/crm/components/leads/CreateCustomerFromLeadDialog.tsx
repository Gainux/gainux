import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "../customers/CustomerForm";
import { customerService } from "../../services/customerService";
import type { Lead, Company } from "../../types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CreateCustomerFromLeadDialogProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCustomerFromLeadDialog({ lead, open, onOpenChange }: CreateCustomerFromLeadDialogProps) {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleClose = () => {
        setShowForm(false);
        onOpenChange(false);
    };

    const handleYes = () => {
        setShowForm(true);
    };

    const handleCreate = async (data: Partial<Company>) => {
        try {
            setSaving(true);
            const customer = await customerService.createCustomer(data);
            toast.success(`Customer "${customer.name}" created successfully`);
            handleClose();
            navigate(`/crm/customers/${customer.id}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to create customer");
        } finally {
            setSaving(false);
        }
    };

    const prefilledData: Partial<Company> = lead ? {
        name: lead.companyName || `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone,
    } : {};

    return (
        <Dialog open={open} onOpenChange={open => { if (!open) handleClose(); }}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Project Complete!</DialogTitle>
                    <DialogDescription>
                        {lead ? `${lead.firstName} ${lead.lastName}'s project is now complete.` : ""}
                        {" "}Would you like to create a customer record from this lead?
                    </DialogDescription>
                </DialogHeader>

                {!showForm ? (
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={handleClose}>No, Skip</Button>
                        <Button onClick={handleYes}>Yes, Create Customer</Button>
                    </div>
                ) : (
                    <CustomerForm
                        initialData={prefilledData as Company}
                        onSubmit={handleCreate}
                        onCancel={handleClose}
                        loading={saving}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
