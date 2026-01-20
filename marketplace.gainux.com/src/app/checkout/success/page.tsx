import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function CheckoutSuccessPage() {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Thank you for your order!</h1>
            <p className="text-muted-foreground max-w-md mb-8">
                Your payment was successful and your software is ready. You will receive an email confirmation shortly.
            </p>
            <div className="flex gap-4">
                <Button asChild size="lg">
                    <Link href="/dashboard/downloads">Go to Downloads</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        </div>
    )
}
