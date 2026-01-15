
import { Button } from "@/components/ui/button";
import { CheckCircle2, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import webDevImg from "@/assets/web-dev.png";

export function WebDevelopment() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 bg-muted/30">
                <div className="container px-4 text-center">
                    <Globe className="h-16 w-16 mx-auto mb-6 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">Website Development</h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                        We build high-performance, responsive, and SEO-optimized websites that drive growth and engagement for your business.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Custom Web Solutions</h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                                Your website is your digital storefront. We create custom web solutions tailored to your unique brand identity and business goals. whether you need a simple corporate site or a complex web application.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Responsive Design for Mobile & Desktop",
                                    "SEO-Friendly Architecture",
                                    "Fast Loading Speeds (Core Web Vitals)",
                                    "Modern Frameworks (React, Next.js)",
                                    "Secure & Scalable Infrastructure",
                                    "Content Management Systems (CMS)"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" className="mt-8">
                                <Link to="/request-service">Get a Free Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                        <div className="rounded-xl overflow-hidden aspect-video border shadow-sm">
                            <img
                                src={webDevImg}
                                alt="Web Development"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
