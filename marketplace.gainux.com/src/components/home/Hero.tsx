import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
    return (
        <section className="relative bg-neutral-900 text-white py-24 md:py-32 overflow-hidden">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-500 via-neutral-900 to-neutral-900"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                    Premium Software <br className="hidden md:inline" /> for Modern Businesses
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-300 mb-10">
                    Discover top-tier software solutions tailored to elevate your productivity and streamline your operations. Instant verification and secure delivery.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100" asChild>
                        <Link href="/products">Browse Catalog</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 hover:text-white" asChild>
                        <Link href="/contact">Contact Sales</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
