"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CartSheet } from "@/features/cart/components/CartSheet"

export function Header() {
    const { user, signOut } = useAuth()

    return (
        <header className="border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                        Gainux Marketplace
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="/products" className="text-muted-foreground hover:text-foreground">
                            Software
                        </Link>
                        <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                            Categories
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <CartSheet />
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/avatars/01.png" alt={user.email || ""} />
                                        <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">User</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/orders">My Orders</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/downloads">My Downloads</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()}>
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/auth/login">Sign In</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/auth/signup">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
