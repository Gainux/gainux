import { MetadataRoute } from 'next'
import { productsService } from '@/features/products/products.service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://marketplace.gainux.com' // Replace with actual domain

    // Get all products
    const products = await productsService.getProducts()

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...productUrls,
    ]
}
