
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    noindex?: boolean;
}

export function SEO({ title, description, canonical, noindex = false }: SEOProps) {
    const siteUrl = "https://gainux.com"; // Replace with actual domain
    const fullTitle = `${title} | Gainux`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Gainux",
        "url": siteUrl,
        "logo": `${siteUrl}/logo.png`, // Update if logo path differs
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-8075107480",
            "contactType": "customer service",
            "areaServed": "Global"
        },
        "sameAs": [
            // Add social links here if available
        ]
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical ? `${siteUrl}${canonical}` : siteUrl} />

            {/* Robots */}
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {!noindex && <meta name="robots" content="index, follow" />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical ? `${siteUrl}${canonical}` : siteUrl} />
            {/* <meta property="og:image" content={`${siteUrl}/og-image.jpg`} /> */}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />

            {/* Structured Data (JSON-LD) for AI Searchability */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </Helmet>
    );
}
