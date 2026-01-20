import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceService } from "../services/marketplaceService";
import type { Product } from "../services/marketplaceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = id && id !== "new";

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        slug: "",
        description: "",
        price: 0,
        category: "",
        version: "1.0.0",
        download_url: "",
        image_url: ""
    });

    useEffect(() => {
        if (isEditing) {
            loadProduct(id);
        }
    }, [id]);

    const loadProduct = async (productId: string) => {
        try {
            setLoading(true);
            const product = await marketplaceService.getProduct(productId);
            if (product) {
                setFormData(product);
            }
        } catch (error) {
            console.error("Failed to load product", error);
            toast.error("Failed to load product details");
            navigate("/marketplace/products");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);

            // Auto-generate slug if empty
            if (!formData.slug && formData.name) {
                formData.slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            }

            if (isEditing && id) {
                await marketplaceService.updateProduct(id, formData);
                toast.success("Product updated successfully");
            } else {
                await marketplaceService.createProduct(formData);
                toast.success("Product created successfully");
                navigate("/marketplace/products");
            }
        } catch (error: any) {
            console.error("Failed to save product", error);
            toast.error(error.message || "Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/marketplace/products")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isEditing ? "Edit Product" : "New Product"}
                    </h2>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 lg:col-span-5 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Gainux CRM"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">Slug (URL)</Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            placeholder="gainux-crm"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="version">Version</Label>
                                        <Input
                                            id="version"
                                            name="version"
                                            value={formData.version}
                                            onChange={handleChange}
                                            placeholder="1.0.0"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="image_url">Image URL</Label>
                                    <Input
                                        id="image_url"
                                        name="image_url"
                                        value={formData.image_url || ""}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="download_url">Download URL (PDF/Zip)</Label>
                                    <Input
                                        id="download_url"
                                        name="download_url"
                                        value={formData.download_url || ""}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price ($) *</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Input
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" /> Save Product
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
