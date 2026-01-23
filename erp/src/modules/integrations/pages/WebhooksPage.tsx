import { useState, useEffect } from "react";
import { integrationService } from "../services/integrationService";
import type { Webhook } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash, Plus, Radio } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [url, setUrl] = useState("");

    useEffect(() => {
        loadWebhooks();
    }, []);

    const loadWebhooks = async () => {
        try {
            setLoading(true);
            const data = await integrationService.getWebhooks();
            setWebhooks(data);
        } catch (_error) {
            toast.error("Failed to load webhooks");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!url) return;
        try {
            // Defaulting to all events for demo
            await integrationService.createWebhook(url, ['*']);
            toast.success("Webhook registered");
            setUrl("");
            loadWebhooks();
        } catch (_error) {
            toast.error("Failed to register webhook");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await integrationService.deleteWebhook(id);
            setWebhooks(prev => prev.filter(w => w.id !== id));
            toast.success("Webhook deleted");
        } catch (_error) {
            toast.error("Failed to delete webhook");
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-medium">Webhooks</h3>
                <p className="text-sm text-muted-foreground">Receive real-time notifications for system events.</p>
            </div>

            <Card className="bg-muted/50 border-dashed">
                <CardHeader>
                    <CardTitle className="text-base">Register New Endpoint</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <div className="grid gap-2 flex-1">
                        <Label htmlFor="url" className="sr-only">Endpoint URL</Label>
                        <Input
                            id="url"
                            placeholder="https://api.your-app.com/webhooks"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Webhook
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {webhooks.map((hook) => (
                    <Card key={hook.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                                    {hook.url}
                                </CardTitle>
                                <CardDescription className="text-xs font-mono break-all">
                                    Secret: {hook.secret}
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(hook.id)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mt-2">
                                {hook.events.map(event => (
                                    <Badge key={event} variant="secondary">{event}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {webhooks.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No webhooks registered.
                    </div>
                )}
            </div>
        </div>
    );
}
