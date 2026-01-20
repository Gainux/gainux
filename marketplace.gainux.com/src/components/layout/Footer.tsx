import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-gray-50 border-t py-12 text-sm text-gray-500">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Gainux Marketplace</h3>
                    <p>Premium software for your business needs.</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Products</h3>
                    <ul className="space-y-2">
                        <li><Link href="/products" className="hover:text-gray-900">All Software</Link></li>
                        <li><Link href="/categories" className="hover:text-gray-900">Categories</Link></li>
                        <li><Link href="/new-arrivals" className="hover:text-gray-900">New Arrivals</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                    <ul className="space-y-2">
                        <li><Link href="/help" className="hover:text-gray-900">Help Center</Link></li>
                        <li><Link href="/contact" className="hover:text-gray-900">Contact Us</Link></li>
                        <li><Link href="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                    <ul className="space-y-2">
                        <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
                        <li><Link href="/license" className="hover:text-gray-900">License Agreement</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-8 pt-8 border-t text-center">
                &copy; {new Date().getFullYear()} Gainux. All rights reserved.
            </div>
        </footer>
    )
}
