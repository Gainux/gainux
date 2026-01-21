import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { DollarSign, Users, Briefcase, TrendingUp } from "lucide-react";
import { crmService } from "../services/crmService";
import type { Deal, Lead } from "../types";

export default function CRMDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeDeals: 0,
        newLeads: 0,
        winRate: 0
    });
    const [funnelData, setFunnelData] = useState<{ name: string, value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [deals, leads] = await Promise.all([
                crmService.getDeals(),
                crmService.getLeads()
            ]);

            // Calculate Stats
            const wonDeals = deals.filter(d => d.stage === 'won');
            const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
            const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
            const newLeads = leads.filter(l => l.status === 'new').length;
            const winRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;

            setStats({
                totalRevenue,
                activeDeals,
                newLeads,
                winRate
            });

            // Calculate Funnel
            const stages = ['lead', 'proposal', 'negotiation', 'won', 'lost'];
            const funnel = stages.map(stage => ({
                name: stage.charAt(0).toUpperCase() + stage.slice(1),
                value: deals.filter(d => d.stage === stage).length
            }));
            setFunnelData(funnel);

        } catch (error) {
            console.error("Failed to load CRM dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">CRM Overview</h2>
            </div>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From won deals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeDeals}</div>
                        <p className="text-xs text-muted-foreground">In pipeline</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.newLeads}</div>
                        <p className="text-xs text-muted-foreground">Waiting for contact</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Deals won vs total</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Sales Funnel */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Pipeline Funnel</CardTitle>
                        <CardDescription>Deal distribution by stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
