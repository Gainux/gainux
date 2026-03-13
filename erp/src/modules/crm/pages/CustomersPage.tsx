import { DataTable } from "@/modules/crm/components/leads/data-table"
import { getColumns } from "@/modules/crm/components/customers/columns"
import type { Company } from "@/modules/crm/types"

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
import { crmService } from "@/modules/crm/services/crmService" // Using crmService
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CustomersPage() {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const companies = await crmService.getCompanies()
            setData(companies)
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

    const handleCreate = async (newCompanyData: Partial<Company>) => {
        try {
            const newCompany = await crmService.createCompany(newCompanyData)
            setData([newCompany, ...data])
            setOpen(false)
        } catch (err: any) {
            console.error("Error creating customer:", err)
            setError("Failed to create customer")
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">Customers</h2>
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

            <div className="h-full flex-1 flex-col space-y-8 flex">
                {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <DataTable columns={getColumns(fetchCustomers)} data={data} searchKey="name" />
                )}
            </div>
        </div>
    )
}
