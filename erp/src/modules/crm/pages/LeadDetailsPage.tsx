import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Phone,
    Mail,
    ArrowLeft,
    Building,
    Plus,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import type { Lead } from "@/modules/crm/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LeadDetailsPage() {
    const { id } = useParams();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchLead = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("leads")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setLead({
                    ...data,
                    lastContacted: data.last_contacted
                });
            } catch (err: any) {
                console.error("Error fetching lead:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLead();
    }, [id]);

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error || !lead) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertDescription>{error || "Lead not found"}</AlertDescription>
                </Alert>
                <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b bg-background p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://avatar.vercel.sh/${lead.email}`} />
                            <AvatarFallback>{lead.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building className="h-4 w-4" />
                                <span>{lead.title} at {lead.company}</span>
                            </div>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant={lead.status === "qualified" ? "default" : "secondary"}>
                            {lead.status}
                        </Badge>
                        <Button variant="outline">
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                        </Button>
                        <Button variant="outline">
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                <TabsTrigger value="notes">Notes</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Contact Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                                <p>{lead.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                                <p>{lead.phone || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Source</p>
                                                <p className="capitalize">{lead.source || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Last Contacted</p>
                                                <p>{lead.lastContacted ? format(new Date(lead.lastContacted), "MMM d, yyyy") : '-'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="timeline" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Activity Timeline</CardTitle>
                                        <CardDescription>Recent interactions and updates.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-muted-foreground">
                                            No activity yet.
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="notes" className="mt-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Notes</CardTitle>
                                        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Note</Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-muted-foreground">
                                            No notes added yet.
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {(lead.tags || []).map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs border border-dashed">+ Add</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
