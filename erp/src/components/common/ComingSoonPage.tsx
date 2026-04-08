import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ComingSoonPageProps {
    title: string;
    description?: string;
}

export default function ComingSoonPage({ title, description }: ComingSoonPageProps) {
    const navigate = useNavigate();

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
                <Construction className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h1 className="text-xl md:text-3xl font-bold tracking-tight">{title}</h1>
                <p className="max-w-[600px] text-muted-foreground">
                    {description || "This module is currently under development. Check back soon for updates!"}
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
                <Button onClick={() => navigate("/")}>
                    Back to Dashboard
                </Button>
            </div>
        </div>
    );
}
