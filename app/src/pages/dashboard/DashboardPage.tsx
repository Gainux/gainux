/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
    Users,
    CheckCircle2,
    Banknote,
    Wallet,
    Clock,
    ArrowRight,
    PlusCircle,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalLeads: 0,
        convertedDeals: 0,
        totalEarned: 0,
        walletBalance: 0
    });
    const [recentLeads, setRecentLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch Leads
                const { data: leads, error: leadsError } = await supabase
                    .from('leads')
                    .select('*')
                    // Using source as fallback if referrer_id isn't deployed
                    .or(`referrer_id.eq.${user.id},source.eq.Referral_${user.id}`)
                    .order('created_at', { ascending: false });

                if (leadsError) console.error(leadsError);

                const fetchedLeads = leads || [];
                const converted = fetchedLeads.filter(l => l.status === 'won' || l.status === 'qualified').length;

                // Fetch Wallet Data (Assuming a wallets table exists)
                let walletBalance = 0;
                let totalEarned = 0;
                const { data: walletData, error: walletError } = await supabase
                    .from('wallets')
                    .select('balance, total_earned')
                    .eq('user_id', user.id)
                    .single();

                if (!walletError && walletData) {
                    walletBalance = walletData.balance;
                    totalEarned = walletData.total_earned;
                }

                setStats({
                    totalLeads: fetchedLeads.length,
                    convertedDeals: converted,
                    totalEarned,
                    walletBalance
                });

                setRecentLeads(fetchedLeads.slice(0, 5));
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new': return <Badge variant="secondary">Submitted</Badge>;
            case 'contacted': return <Badge variant="default" className="bg-blue-500">Contacted</Badge>;
            case 'negotiation': return <Badge variant="default" className="bg-amber-500">In Progress</Badge>;
            case 'won':
            case 'qualified': return <Badge variant="default" className="bg-green-500">Converted</Badge>;
            case 'lost': return <Badge variant="destructive">Lost</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Overview</h2>
                    <p className="text-muted-foreground/80 mt-1 text-sm">Welcome back! Here's a summary of your referrals and earnings.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-9 px-4">
                        <Link to="/leads/new"><PlusCircle className="w-4 h-4 mr-2" /> Submit Lead</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Leads Card */}
                <Card className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1 py-1">
                                <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Total Leads</p>
                                <p className="text-3xl font-bold tracking-tight text-foreground">{stats.totalLeads}</p>
                            </div>
                            <div className="p-3 bg-secondary rounded-xl text-primary">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-5 flex items-center text-sm font-medium">
                            <span className="text-muted-foreground">Prospects submitted</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Converted Deals Card */}
                <Card className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1 py-1">
                                <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Converted</p>
                                <p className="text-3xl font-bold tracking-tight text-foreground">{stats.convertedDeals}</p>
                            </div>
                            <div className="p-3 bg-secondary rounded-xl text-primary">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-5 flex items-center text-sm font-medium">
                            <span className="text-muted-foreground">Successfully closed</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Earned Card */}
                <Card className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1 py-1">
                                <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Total Earned</p>
                                <p className="text-3xl font-bold tracking-tight text-foreground">₹{stats.totalEarned.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-secondary rounded-xl text-primary">
                                <Banknote className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-5 flex items-center text-sm font-medium">
                            <span className="text-muted-foreground">Lifetime earnings</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet Balance Card (Premium Minimal) */}
                <Card className="border-none bg-primary text-primary-foreground hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group">
                    <CardContent className="p-6 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1 py-1">
                                <p className="text-[13px] font-medium text-primary-foreground/80 uppercase tracking-wider">Wallet Balance</p>
                                <p className="text-3xl font-bold tracking-tight text-white">₹{stats.walletBalance.toLocaleString()}</p>
                            </div>
                            <div className="p-2.5 bg-white/10 rounded-xl">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between text-sm font-medium border-t border-white/10 pt-4">
                            <span className="text-primary-foreground/80">Available to withdraw</span>
                            <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white transition-colors group-hover:translate-x-1" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-8">
                <Card className="glass-card md:col-span-4 lg:col-span-5">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                        <div>
                            <CardTitle>Recent Leads</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Track the status of your latest referrals.</p>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="hidden sm:flex hover:bg-secondary">
                            <Link to="/leads/new">View All <ArrowRight className="ml-2 w-4 h-4" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6 text-sm">
                            {recentLeads.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                                        <Clock className="h-8 w-8 text-muted-foreground/60" />
                                    </div>
                                    <p className="text-base font-semibold text-foreground">No leads submitted yet</p>
                                    <p className="text-sm mt-1 max-w-xs mx-auto">Submit your first prospect to start earning commissions!</p>
                                    <Button asChild variant="default" className="mt-6 px-8">
                                        <Link to="/leads/new">Submit Lead</Link>
                                    </Button>
                                </div>
                            ) : (
                                recentLeads.map(lead => (
                                    <div key={lead.id} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0 hover:bg-secondary/30 p-2 -mx-2 rounded-lg transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-[15px]">{lead.first_name} {lead.last_name}</span>
                                            <span className="text-muted-foreground text-xs">{lead.company_name || lead.email}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(lead.status)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card md:col-span-3 lg:col-span-3 bg-card border-border/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
                                <Users className="w-3 h-3 text-primary" />
                            </div>
                            How it Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-7 text-[15px] mt-4 px-7 pb-8">
                        <div className="flex gap-5 items-start relative pb-2">
                            <div className="absolute left-[1.1rem] top-10 bottom-[-1.5rem] w-[1px] bg-border" />
                            <div className="w-9 h-9 rounded-full bg-card border border-border text-primary flex items-center justify-center shrink-0 font-bold shadow-sm text-sm">1</div>
                            <div className="pt-1.5">
                                <p className="font-semibold text-foreground">Submit a Lead</p>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Enter prospect details and get their consent.</p>
                            </div>
                        </div>
                        <div className="flex gap-5 items-start relative pb-2">
                            <div className="absolute left-[1.1rem] top-10 bottom-[-1.5rem] w-[1px] bg-border" />
                            <div className="w-9 h-9 rounded-full bg-card border border-border text-primary flex items-center justify-center shrink-0 font-bold shadow-sm text-sm">2</div>
                            <div className="pt-1.5">
                                <p className="font-semibold text-foreground">We Close It</p>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Our sales team works the lead. Track status live.</p>
                            </div>
                        </div>
                        <div className="flex gap-5 items-start relative">
                            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                            <div className="pt-1.5">
                                <p className="font-semibold text-foreground">You Get Paid</p>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Commission is credited to your virtual wallet.</p>
                            </div>
                        </div>

                        <div className="pt-8 w-full">
                            <Button asChild className="w-full" variant="secondary">
                                <Link to="/wallet">View Wallet Data <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
