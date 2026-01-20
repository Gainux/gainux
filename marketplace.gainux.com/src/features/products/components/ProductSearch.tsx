"use client"

import { Input } from "@/components/ui/input"

export function ProductSearch() {
    return (
        <div className="relative w-full max-w-sm">
            <Input placeholder="Search software..." className="pl-4 pr-10" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
        </div>
    )
}
