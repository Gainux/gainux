export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    price: number;
    currency: string;
    version: string;
    category_id: string;
    category?: Category;
    images: string[];
    features: string[];
    requirements?: Record<string, string>; // e.g., { "OS": "Windows", "RAM": "8GB" }
    demo_url?: string;
    documentation_url?: string;
    created_at: string;
    updated_at: string;
    download_url?: string;
}

export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
}

export interface CartItem {
    product_id: string;
    quantity: number;
    product?: Product;
}
