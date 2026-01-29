import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auditService } from "../services/auditService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { AuditLog } from "../types";

export default function AuditLogsPage() {
    const { profile } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (profile?.org_id) {
            loadLogs(profile.org_id);
        } else {
            setLoading(false);
        }
    }, [profile]);

    const loadLogs = async (orgId: string) => {
        setLoading(true);
        try {
            const data = await auditService.getLogs(orgId);
            setLogs(data);
        } catch (error) {
            console.error("Failed to load audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (profile?.org_id) {
            loadLogs(profile.org_id);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getActionBadgeVariant = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create': return 'default'; // dark/primary
            case 'update': return 'secondary';
            case 'delete': return 'destructive';
            case 'login': return 'outline';
            default: return 'secondary';
        }
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        Track system activity and security events.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by action, user, or entity..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="w-[180px]">Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead className="max-w-[300px]">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {log.user_name || 'Unknown'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getActionBadgeVariant(log.action) as any} className="uppercase text-[10px]">
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.entity}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{log.entity_id.substring(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate" title={JSON.stringify(log.details, null, 2)}>
                                                {JSON.stringify(log.details)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <div className="bg-muted/50 p-4 rounded-full mb-4">
                                                    <AlertCircle className="h-8 w-8" />
                                                </div>
                                                <p className="text-lg font-medium">No activity log found</p>
                                                <p className="text-sm">
                                                    {searchQuery ? "Try adjusting your search query." : "There are no activities recorded yet."}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
