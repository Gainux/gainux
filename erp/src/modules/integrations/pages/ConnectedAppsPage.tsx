import { useState, useEffect } from "react";
import { integrationService } from "../services/integrationService";
import type { ConnectedApp } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Mail, Slack, Cloud } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, any> = {
    slack: Slack,
    mail: Mail,
    'credit-card': CreditCard,
    cloud: Cloud
};

export default function ConnectedAppsPage() {
    const [apps, setApps] = useState<ConnectedApp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApps();
    }, []);

    const loadApps = async () => {
        try {
            setLoading(true);
            const data = await integrationService.getConnectedApps();
            setApps(data);
        } catch (error) {
            toast.error("Failed to load apps");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, currentState: boolean) => {
        try {
            // Optimistic update
            setApps(prev => prev.map(a => a.id === id ? { ...a, isConnected: !currentState } : a));
            await integrationService.toggleAppConnection(id, !currentState);
            toast.success(currentState ? "App disconnected" : "App connected");
        } catch (error) {
            toast.error("Failed to update connection");
            loadApps(); // Revert on error
        }
    };

    if (loading) return <div>Loading integrations...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apps.map(app => {
                const Icon = ICON_MAP[app.icon] || Cloud;
                return (
                    <Card key={app.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-muted rounded-md">
                                    <Icon className="h-5 w-5" />
                                </div>
                                {app.name}
                            </CardTitle>
                            {app.isConnected && <Badge variant="secondary" className="bg-green-100 text-green-700">Connected</Badge>}
                        </CardHeader>
                        <CardContent className="pt-4">
                            <CardDescription className="h-10">
                                {app.description}
                            </CardDescription>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                {app.isConnected ? 'Sync active' : 'Not connected'}
                            </span>
                            <Switch
                                checked={app.isConnected}
                                onCheckedChange={() => handleToggle(app.id, app.isConnected)}
                            />
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
