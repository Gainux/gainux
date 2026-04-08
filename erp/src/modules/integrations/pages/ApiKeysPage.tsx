import { useState, useEffect } from "react";
import { integrationService } from "../services/integrationService";
import type { ApiKey } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        try {
            setLoading(true);
            const data = await integrationService.getApiKeys();
            setKeys(data);
        } catch (_error) {
            toast.error("Failed to load API keys");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newKeyName) return;
        try {
            await integrationService.createApiKey(newKeyName);
            toast.success("API Key created");
            setIsCreateOpen(false);
            setNewKeyName("");
            loadKeys();
        } catch (_error) {
            toast.error("Failed to create key");
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure? This will break any apps using this key.")) return;
        try {
            await integrationService.revokeApiKey(id);
            toast.success("API Key revoked");
            loadKeys();
        } catch (_error) {
            toast.error("Failed to revoke key");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium">API Keys</h3>
                    <p className="text-sm text-muted-foreground">Manage access keys for the Gainux API.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create New Key</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create API Key</DialogTitle>
                            <DialogDescription>
                                Enter a name for this key to identify where it is used.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Key Name</Label>
                                <Input
                                    id="name"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g. Production Backend"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create Key</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Key Prefix</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Last Used</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                        ) : keys.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">No API keys found.</TableCell></TableRow>
                        ) : (
                            keys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium">{key.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{key.keyPrefix}</TableCell>
                                    <TableCell>{format(new Date(key.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        {key.lastUsedAt ? format(new Date(key.lastUsedAt), 'MMM d, HH:mm') : 'Never'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={key.status === 'active' ? 'default' : 'destructive'}>
                                            {key.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                navigator.clipboard.writeText(key.keyPrefix);
                                                toast.success("Key prefix copied");
                                            }}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        {key.status === 'active' &&
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600"
                                                onClick={() => handleRevoke(key.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
