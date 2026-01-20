import { productsService } from "@/features/products/products.service";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, LayoutGrid, Package } from "lucide-react";

export default async function CategoriesPage() {
    const categories = await productsService.getCategories();

    return (
        <div className="container py-8 md:py-12">
            <div className="flex flex-col gap-4 md:gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Software Categories</h1>
                    <p className="text-muted-foreground text-lg">
                        Browse our premium software by category to find the perfect solution for your business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link href={`/products?category=${category.slug || category.id}`} key={category.id} className="group">
                            <Card className="h-full transition-all hover:bg-muted/50 hover:shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {category.icon ? (
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    {/* We could dynamically render icons here if mapped, for now using generic */}
                                                    <LayoutGrid className="h-6 w-6" />
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                            )}
                                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                                {category.name}
                                            </CardTitle>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <CardDescription className="pt-2 text-base">
                                        {category.description || `Browse all ${category.name} software solutions.`}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}

                    {categories.length === 0 && (
                        <div className="col-span-full py-12 text-center border rounded-lg bg-muted/10">
                            <p className="text-muted-foreground">No categories found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
