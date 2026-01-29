import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChartOfAccounts from '../components/ChartOfAccounts';
import JournalEntryList from '../components/JournalEntryList';
import FinancialReports from '../components/FinancialReports';
import { FileText, FileSpreadsheet, BookOpen } from 'lucide-react';

export default function GeneralLedgerPage() {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
                <p className="text-muted-foreground">
                    Manage your Chart of Accounts, Journal Entries, and Financial Reports.
                </p>
            </div>

            <Tabs defaultValue="coa" className="space-y-4">
                <TabsList className="flex flex-wrap h-auto gap-2">
                    <TabsTrigger value="coa" className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Chart of Accounts
                    </TabsTrigger>
                    <TabsTrigger value="journals" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Journal Entries
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Reports
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="coa" className="space-y-4">
                    <ChartOfAccounts />
                </TabsContent>

                <TabsContent value="journals">
                    <JournalEntryList />
                </TabsContent>

                <TabsContent value="reports">
                    <FinancialReports />
                </TabsContent>
            </Tabs>
        </div>
    );
}
