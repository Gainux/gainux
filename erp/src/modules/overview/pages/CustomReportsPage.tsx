
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

const REPORT_TYPES = [
    { id: 'financial_summary', name: 'Financial Summary', category: 'Finance' },
    { id: 'employee_roster', name: 'Employee Roster', category: 'HR' },
    { id: 'project_status', name: 'Project Status Report', category: 'Projects' },
    { id: 'sales_performance', name: 'Sales Performance', category: 'Sales' },
    { id: 'inventory_valuation', name: 'Inventory Valuation', category: 'Inventory' },
];

export default function CustomReportsPage() {
    const [reportType, setReportType] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = () => {
        if (!reportType) {
            toast.error("Please select a report type");
            return;
        }

        setLoading(true);

        // Simulate report generation
        setTimeout(() => {
            setLoading(false);
            const reportName = REPORT_TYPES.find(r => r.id === reportType)?.name;
            toast.success(`${reportName} generated successfully!`);

            // Simulate download
            const blob = new Blob([`Report: ${reportName}\nDate Generated: ${new Date().toISOString()}\n\n[Mock Data Content]`], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}_report.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, 2000);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Custom Reports</h2>
                    <p className="text-muted-foreground">Generate and download detailed reports for your organization.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Report Configuration</CardTitle>
                        <CardDescription>Select the parameters for your report.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="report-type">Report Type</Label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger id="report-type">
                                    <SelectValue placeholder="Select a report..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_TYPES.map((report) => (
                                        <SelectItem key={report.id} value={report.id}>
                                            <span className="font-medium mr-2">{report.name}</span>
                                            <span className="text-xs text-muted-foreground">({report.category})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        className="pl-8"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>End Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        className="pl-8"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full sm:w-auto"
                            onClick={handleGenerate}
                            disabled={loading || !reportType}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Report...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Generate & Download CSV
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Reports</CardTitle>
                        <CardDescription>Previously generated reports.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted p-2 rounded-lg">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Financial_Summary_Q{i}.csv</p>
                                            <p className="text-xs text-muted-foreground">Generated 2 days ago</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
