import { format } from "date-fns";
import { Mail, Phone, Calendar, StickyNote, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Activity } from "@/modules/crm/types";

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const getIcon = (type: Activity["type"]) => {
        switch (type) {
            case "email": return <Mail className="h-4 w-4" />;
            case "call": return <Phone className="h-4 w-4" />;
            case "meeting": return <Calendar className="h-4 w-4" />;
            case "note": return <StickyNote className="h-4 w-4" />;
            case "task": return <CheckCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Activity History</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((item) => (
                        <div key={item.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {item.content}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {getIcon(item.type)}
                                    <span className="capitalize">{item.type}</span>
                                    <span>•</span>
                                    <span>{format(new Date(item.date), "MMM d, h:mm a")}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
