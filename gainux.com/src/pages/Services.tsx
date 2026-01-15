
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Briefcase, MessageSquare, Globe, Smartphone, Zap } from "lucide-react";

export function Services() {
    return (
        <div className="container py-12 md:py-24">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Fast, reliable software solutions with modern, customer-friendly designs.
                    Built by highly skilled developers who deliver results quickly.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="items-center text-center">
                        <Globe className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>Website Development</CardTitle>
                        <CardDescription>
                            Modern, responsive websites built fast
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        From landing pages to complex web applications, we create stunning websites
                        with modern designs that engage your customers and drive conversions.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center text-center">
                        <Smartphone className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>Mobile App Development</CardTitle>
                        <CardDescription>
                            iOS and Android apps with exceptional UX
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        Cross-platform mobile applications built with customer-friendly interfaces
                        that users love. Fast development without compromising quality.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center text-center">
                        <Briefcase className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>Management Software</CardTitle>
                        <CardDescription>
                            Complete business management solutions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        Custom management systems including ERP, CRM, inventory management,
                        and project tracking tailored to your business workflows.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center text-center">
                        <Code className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>HR Software Solutions</CardTitle>
                        <CardDescription>
                            Streamline your HR operations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        Comprehensive HR management systems for employee tracking, payroll,
                        attendance, leave management, and performance evaluation.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center text-center">
                        <MessageSquare className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>WhatsApp Automation</CardTitle>
                        <CardDescription>
                            Automated customer engagement via WhatsApp
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        Intelligent WhatsApp automation for customer support, marketing campaigns,
                        notifications, and business communications. Scale your customer interactions effortlessly.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center text-center">
                        <Zap className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>Business Automation</CardTitle>
                        <CardDescription>
                            Automate repetitive tasks and workflows
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        End-to-end business process automation to eliminate manual work, reduce errors,
                        and boost productivity. From data entry to complex workflows.
                    </CardContent>
                </Card>
            </div>

            <div className="mt-16 text-center">
                <div className="bg-muted/40 rounded-lg p-8 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Why Choose Gainux?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div>
                            <h3 className="font-semibold mb-2">⚡ High Development Speed</h3>
                            <p className="text-sm text-muted-foreground">
                                We deliver projects faster without compromising on quality or features.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">👥 Highly Skilled Team</h3>
                            <p className="text-sm text-muted-foreground">
                                Our developers are experts in the latest technologies and best practices.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">🎨 Modern Design</h3>
                            <p className="text-sm text-muted-foreground">
                                Customer-friendly interfaces that are intuitive, beautiful, and engaging.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
