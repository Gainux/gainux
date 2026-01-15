import { DataTable } from "@/modules/crm/components/leads/data-table" // Reusing generic data table
import { columns } from "@/modules/crm/components/customers/columns"
import type { Customer } from "@/modules/crm/types"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CustomerForm } from "../components/customers/CustomerForm"
import { customerService } from "../services/customerService"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CustomersPage() {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const customers = await customerService.getCustomers()
            // Map snake_case from DB to camelCase for UI if not handled in service
            // The service handles it for single returns, but for select(*) raw return we might need mapping 
            // depending on how strict Supabase typing is. 
            // For now assuming service returns raw DB fields if we didn't map them explicitly in select.
            // Let's ensure the service maps them or we map them here.
            // Updated service to just return data, so we map here for safety:
            const mappedCustomers = customers.map((c: any) => ({
                ...c,
                totalRevenue: c.total_revenue || c.totalRevenue || "₹0.00",
                lastOrderDate: c.last_order_date || c.lastOrderDate || "-",
            }))
            setData(mappedCustomers)
        } catch (err: any) {
            console.error("Error fetching customers:", err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const handleCreate = async (newCustomerData: Partial<Customer>) => {
        try {
            const newCustomer = await customerService.createCustomer(newCustomerData)
            setData([newCustomer, ...data])
            setOpen(false)
        } catch (err: any) {
            console.error("Error creating customer:", err)
            setError("Failed to create customer")
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Customer</DialogTitle>
                            <DialogDescription>
                                Add a new customer to your CRM.
                            </DialogDescription>
                        </DialogHeader>
                        <CustomerForm
                            onSubmit={handleCreate}
                            onCancel={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="name" />
                )}
            </div>
        </div>
    )
}
