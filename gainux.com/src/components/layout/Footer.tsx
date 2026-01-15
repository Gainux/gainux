
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                            <img src={logo} alt="Gainux Logo" className="h-8 w-auto" />
                            <span>Gainux</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Fast, reliable software solutions for all businesses. From websites and mobile apps
                            to automation and enterprise systems.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
                            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
                            <li><Link to="/careers" className="hover:text-primary">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Connect</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary">Twitter</a></li>
                            <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
                            <li><a href="#" className="hover:text-primary">Instagram</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Gainux. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
