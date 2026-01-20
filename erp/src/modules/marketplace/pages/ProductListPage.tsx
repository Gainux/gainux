import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, Trash, Download } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { marketplaceService } from "../services/marketplaceService";
import type { Product } from "../services/marketplaceService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await marketplaceService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await marketplaceService.deleteProduct(id);
            toast.success("Product deleted successfully");
            loadProducts();
        } catch (error) {
            console.error("Failed to delete product", error);
            toast.error("Failed to delete product");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Marketplace Products</h2>
                <Button onClick={() => navigate("/marketplace/products/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Version</TableHead>
                                <TableHead>Downloadable</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{product.name}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{product.category}</Badge>
                                        </TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>{product.version}</TableCell>
                                        <TableCell>
                                            {product.download_url ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-400">No</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/marketplace/products/${product.id}`)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the product "{product.name}" from the marketplace.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
