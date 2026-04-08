import { Loader2 } from "lucide-react";

export default function PageLoading() {
    return (
        <div className="flex bg-background h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
}
