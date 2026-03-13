import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, AlertCircle, PieChart } from "lucide-react";

interface ExpenseStatsProps {
    metrics: {
        totalThisMonth: number;
        totalPending: number;
        categoryBreakdown: Record<string, number>;
    };
    loading?: boolean;
}

export default function ExpenseStats({ metrics, loading }: ExpenseStatsProps) {
    if (loading) {
        return <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-32 bg-muted rounded" />
                    </CardContent>
                </Card>
            ))}
        </div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Expenses (This Month)
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg md:text-2xl font-bold">{formatCurrency(metrics.totalThisMonth)}</div>
                    <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Pending Approval
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg md:text-2xl font-bold">{formatCurrency(metrics.totalPending)}</div>
                    <p className="text-xs text-muted-foreground">
                        Requires attention
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Top Category
                    </CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold capitalize">
                        {Object.entries(metrics.categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Most spending this month
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
