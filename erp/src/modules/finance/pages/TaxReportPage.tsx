
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { taxService } from '../services/taxService';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/useCurrency';

export default function TaxReportPage() {
    const { profile } = useAuth();
    const { formatAmount } = useCurrency();
    const [, setLoading] = useState(true);
    const [report, setReport] = useState({
        totalSales: 0,
        totalTaxCollected: 0,
        totalPurchases: 0,
        totalTaxPaid: 0,
        netTaxPayable: 0
    });

    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    useEffect(() => {
        if (profile?.org_id) {
            fetchReport();
        }
    }, [profile?.org_id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await taxService.getTaxReport(profile?.org_id || "", startDate, endDate);
            setReport(data);
        } catch (error) {
            console.error('Failed to load tax report', error);
            toast.error('Failed to load tax report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tax Liability Report</h2>
                    <p className="text-muted-foreground">Overview of tax collected vs paid.</p>
                </div>
                {/* Date Filter */}
                <div className="flex items-end gap-2">
                    <div className='grid gap-1.5'>
                        <Label>From</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-[150px]"
                        />
                    </div>
                    <div className='grid gap-1.5'>
                        <Label>To</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-[150px]"
                        />
                    </div>
                    <Button variant="secondary" onClick={fetchReport}>
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Sales / Output Tax */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tax Collected (Sales)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatAmount(report.totalTaxCollected)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            on Sales of {formatAmount(report.totalSales)}
                        </p>
                    </CardContent>
                </Card>

                {/* Purchases / Input Tax */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tax Paid (Purchases)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatAmount(report.totalTaxPaid)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            on Purchases of {formatAmount(report.totalPurchases)}
                        </p>
                    </CardContent>
                </Card>

                {/* Net Payable */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Tax Payable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${report.netTaxPayable >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatAmount(Math.abs(report.netTaxPayable))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {report.netTaxPayable >= 0 ? "You owe to Govt" : "Credit (Receivable)"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
