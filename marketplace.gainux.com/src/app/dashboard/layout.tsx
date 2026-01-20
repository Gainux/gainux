"use client"

import { useAuth } from "@/features/auth/context"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'My Orders', href: '/dashboard/orders' },
    { name: 'My Downloads', href: '/dashboard/downloads' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/auth/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row gap-10">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0 space-y-2">
                    <h2 className="mb-4 text-xl font-bold">My Account</h2>
                    <nav className="flex flex-col space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <Button
                                key={item.href}
                                asChild
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className={cn("justify-start", pathname === item.href && "bg-muted")}
                            >
                                <Link href={item.href}>{item.name}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
