


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { crmService } from "../services/crmService";
import type { Company, Deal } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Building, Edit, Globe, Phone, MapPin } from "lucide-react";
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
    const [company, setCompany] = useState<Company | null>(null);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [dealsLoading, setDealsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await crmService.getCompanyById(id);
                setCompany(data);
            } catch (err: any) {
                console.error("Error fetching company:", err);
                setError(err.message || "Failed to load company details");
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    useEffect(() => {
        const fetchDeals = async () => {
            if (!id) return;
            try {
                setDealsLoading(true);
                const dealsData = await crmService.getDealsByCompany(id);
                setDeals(dealsData);
            } catch (err: any) {
                console.error("Error fetching deals:", err);
            } finally {
                setDealsLoading(false);
            }
        };
        fetchDeals();
    }, [id]);

    const handleUpdate = async (updates: Partial<Company>) => {
        if (!company) return;
        try {
            const updatedCompany = await crmService.updateCompany(company.id, updates);
            setCompany(updatedCompany);
            setEditOpen(false);
        } catch (err: any) {
            console.error("Error updating company:", err);
            alert(`Failed to update company: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertDescription>{error || "Company not found"}</AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/crm/customers")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/crm/customers")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold tracking-tight">{company.name}</h2>
                        <div className="flex items-center text-muted-foreground mt-1">
                            <Building className="mr-1 h-4 w-4" />
                            <span className="mr-4">{company.industry || 'Industry N/A'}</span>
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
                                <DialogTitle>Edit Company</DialogTitle>
                                <DialogDescription>
                                    Update company details.
                                </DialogDescription>
                            </DialogHeader>
                            {/* Note: Partial mismatch in props, but casting for now to enable basic edit */}
                            <CustomerForm
                                initialData={company as any}
                                onSubmit={(data) => handleUpdate(data as unknown as Partial<Company>)}
                                onCancel={() => setEditOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
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
                                {company.phone && (
                                    <div className="flex items-center">
                                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{company.phone}</span>
                                    </div>
                                )}
                                {company.website && (
                                    <div className="flex items-center">
                                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                            {company.website}
                                        </a>
                                    </div>
                                )}
                                {company.address && (
                                    <div className="flex items-start">
                                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{company.address}</span>
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
                            <CardDescription>Active and past deals with this company.</CardDescription>
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
                                                    <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value || 0)}</span>
                                                    {deal.expectedCloseDate && (
                                                        <span className="text-muted-foreground">Close: {deal.expectedCloseDate}</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No deals found for this company.</p>
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
