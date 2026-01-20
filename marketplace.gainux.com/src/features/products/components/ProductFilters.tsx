"use client"

import { Category } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ProductFiltersProps {
    categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
    const [priceRange, setPriceRange] = useState([0, 500])

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-3">
                    {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox id={category.id} />
                            <Label htmlFor={category.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {category.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                <Slider
                    defaultValue={[0, 500]}
                    max={1000}
                    step={10}
                    className="mb-4"
                    onValueChange={setPriceRange}
                />
                <div className="flex items-center justify-between text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                </div>
            </div>

            <Button className="w-full">Apply Filters</Button>
        </div>
    )
}
