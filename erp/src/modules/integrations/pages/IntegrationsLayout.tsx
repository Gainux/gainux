import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IntegrationsLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab based on path
    const getActiveTab = () => {
        if (location.pathname.includes('/integrations/apps')) return 'apps';
        if (location.pathname.includes('/integrations/api-keys')) return 'api-keys';
        if (location.pathname.includes('/integrations/webhooks')) return 'webhooks';
        return 'apps';
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Integrations & API</h2>
                    <p className="text-muted-foreground">Connect third-party tools and manage API access.</p>
                </div>
            </div>

            <Tabs value={getActiveTab()} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="apps" onClick={() => navigate('/integrations/apps')}>Connected Apps</TabsTrigger>
                    <TabsTrigger value="api-keys" onClick={() => navigate('/integrations/api-keys')}>API Keys</TabsTrigger>
                    <TabsTrigger value="webhooks" onClick={() => navigate('/integrations/webhooks')}>Webhooks</TabsTrigger>
                </TabsList>
                <div className="pt-4">
                    <Outlet />
                </div>
            </Tabs>
        </div>
    );
}
