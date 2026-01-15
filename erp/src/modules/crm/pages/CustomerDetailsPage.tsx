


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { customerService } from "../services/customerService";
import { dealService } from "../services/dealService";
import type { Customer, Deal } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Mail, Building, DollarSign, Calendar, Edit } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerForm } from "../components/customers/CustomerForm";

export default function CustomerDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [dealsLoading, setDealsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await customerService.getCustomerById(id);
                setCustomer(data);
            } catch (err: any) {
                console.error("Error fetching customer:", err);
                setError(err.message || "Failed to load customer details");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    useEffect(() => {
        const fetchDeals = async () => {
            if (!id) return;
            try {
                setDealsLoading(true);
                const dealsData = await dealService.getDealsByCustomer(id);
                setDeals(dealsData);
            } catch (err: any) {
                console.error("Error fetching deals:", err);
            } finally {
                setDealsLoading(false);
            }
        };
        fetchDeals();
    }, [id]);

    const handleUpdate = async (updates: Partial<Customer>) => {
        if (!customer) return;
        try {
            const updatedCustomer = await customerService.updateCustomer(customer.id, updates);
            setCustomer(updatedCustomer);
            setEditOpen(false);
        } catch (err: any) {
            console.error("Error updating customer:", err);
            alert(`Failed to update customer: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertDescription>{error || "Customer not found"}</AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/crm/customers")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/crm/customers")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{customer.name}</h2>
                        <div className="flex items-center text-muted-foreground mt-1">
                            <Building className="mr-1 h-4 w-4" />
                            <span className="mr-4">{customer.company}</span>
                            <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                                {customer.status}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Customer</DialogTitle>
                                <DialogDescription>
                                    Update customer details.
                                </DialogDescription>
                            </DialogHeader>
                            <CustomerForm
                                initialData={customer}
                                onSubmit={handleUpdate}
                                onCancel={() => setEditOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.totalRevenue}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Order</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.lastOrderDate || "N/A"}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{customer.email}</span>
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center">
                                        <span className="mr-2 text-muted-foreground">Phone:</span>
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.website && (
                                    <div className="flex items-center">
                                        <span className="mr-2 text-muted-foreground">Website:</span>
                                        <a href={customer.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                            {customer.website}
                                        </a>
                                    </div>
                                )}
                                {(customer.address || customer.city) && (
                                    <div className="flex items-start">
                                        <span className="mr-2 text-muted-foreground">Address:</span>
                                        <span>
                                            {[customer.address, customer.city, customer.state, customer.zip, customer.country].filter(Boolean).join(", ")}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="deals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Associated Deals</CardTitle>
                            <CardDescription>Active and past deals with this customer.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dealsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : deals.length > 0 ? (
                                <div className="space-y-4">
                                    {deals.map(deal => (
                                        <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/crm/deals/${deal.id}`)}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-base">{deal.title}</CardTitle>
                                                        <p className="text-sm text-muted-foreground mt-1">{deal.company}</p>
                                                    </div>
                                                    <Badge variant={
                                                        deal.stage === 'won' ? 'default' :
                                                            deal.stage === 'lost' ? 'destructive' :
                                                                'secondary'
                                                    }>
                                                        {deal.stage}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold">{deal.formattedValue}</span>
                                                    {deal.expectedCloseDate && (
                                                        <span className="text-muted-foreground">Close: {deal.expectedCloseDate}</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No deals found for this customer.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No recent activity.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
