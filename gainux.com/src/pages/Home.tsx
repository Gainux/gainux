
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowRight,
    Code,
    Layout,
    Smartphone,
    CheckCircle2,
    Zap,
    Globe,
    Briefcase,
    MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Home() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="flex-1 py-12 md:py-24 lg:py-32 xl:py-48 bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
                <div className="container relative z-10 px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Software Solutions for Everyone
                            </h1>
                            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl">
                                From startups to enterprises, we empower your business with innovative technology.
                                Websites, Mobile Apps, Automation, and Custom Software delivered with speed and precision.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button asChild size="lg" className="h-12 px-8 text-lg w-full sm:w-auto">
                                <Link to="/request-service">
                                    Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild className="h-12 px-8 text-lg w-full sm:w-auto">
                                <Link to="/services">Explore Services</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats / Trust Banner */}
            <section className="w-full py-12 bg-primary text-primary-foreground">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold">100%</h3>
                            <p className="text-primary-foreground/80">Client Satisfaction</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold">Fast</h3>
                            <p className="text-primary-foreground/80">Delivery Speed</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold">24/7</h3>
                            <p className="text-primary-foreground/80">Support Available</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold">Modern</h3>
                            <p className="text-primary-foreground/80">Tech Stack</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comprehensive Services Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                                Our Expertise
                            </h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl">
                                We provide a full spectrum of digital services to cover every aspect of your business technology needs.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Service 1 */}
                        <Card className="bg-background border-none shadow-md">
                            <CardHeader>
                                <Globe className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">Website Development</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Stunning, responsive, and high-performance websites. From simple landing pages
                                    to complex e-commerce platforms and web applications using React, Next.js, and more.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Responsive Design</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> SEO Optimized</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Fast Loading</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 2 */}
                        <Card className="bg-background border-none shadow-md">
                            <CardHeader>
                                <Smartphone className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">Mobile App Development</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Native and cross-platform mobile apps for iOS and Android.
                                    We build intuitive, feature-rich apps that users love to engage with.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> iOS & Android</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Flutter & React Native</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> User-Centric UI/UX</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 3 */}
                        <Card className="bg-background border-none shadow-md">
                            <CardHeader>
                                <Briefcase className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">Management Software</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Custom ERP, CRM, and business management tools tailored to your specific workflows.
                                    Streamline operations and gain better insights.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Custom ERP/CRM</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Inventory Management</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Real-time Analytics</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 4 */}
                        <Card className="bg-background border-none shadow-md">
                            <CardHeader>
                                <Layout className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">HR Software</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Complete Human Resource Management Systems (HRMS) to handle payroll,
                                    attendance, recruitment, and employee performance efficiently.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Payroll Automation</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Attendance Tracking</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Employee Portals</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 5 */}
                        <Card className="bg-background border-none shadow-md">
                            <CardHeader>
                                <MessageSquare className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">WhatsApp Automation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Leverage the power of WhatsApp Business API for automated customer support,
                                    marketing notifications, and interactive chatbots.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> 24/7 Chatbots</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Bulk Notifications</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> API Integration</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 6 */}
                        <Card className="bg-background border-none shadow-md">
                            <CardHeader>
                                <Zap className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">Business Automation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Identify and automate repetitive manual tasks to save time and reduce errors.
                                    We build updated workflows that run on autopilot.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Workflow Optimization</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Data Entry Automation</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Process Digitization</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="w-full py-12 md:py-24 bg-background">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                                Why Partner with Gainux?
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                We don't just write code; we build solutions that grow your business.
                                Our team is dedicated to delivering excellence at every step.
                            </p>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="bg-primary/10 p-3 h-fit rounded-lg">
                                        <Zap className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl">High Development Speed</h3>
                                        <p className="text-muted-foreground">
                                            We use modern frameworks suitable for rapid development, ensuring your project
                                            goes to market faster without compromising quality.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="bg-primary/10 p-3 h-fit rounded-lg">
                                        <Code className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl">Highly Skilled Team</h3>
                                        <p className="text-muted-foreground">
                                            Our developers are top-tier experts in their fields, constantly learning
                                            and updating their skills to bring you the best tech.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="bg-primary/10 p-3 h-fit rounded-lg">
                                        <Layout className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl">Modern, Customer-Friendly Design</h3>
                                        <p className="text-muted-foreground">
                                            We prioritize User Experience (UX) and UI design to ensure your customers
                                            enjoy interacting with your digital products.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted rounded-xl aspect-square md:aspect-video lg:aspect-square flex items-center justify-center relative overflow-hidden group">
                            {/* Abstract visual representation */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
                            <div className="relative z-10 grid grid-cols-2 gap-4 p-8">
                                <Card className="bg-background/80 backdrop-blur transform translate-y-4 transition-transform group-hover:translate-y-2 duration-500">
                                    <CardContent className="p-6 text-center">
                                        <Code className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <p className="font-bold">Clean Code</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-background/80 backdrop-blur transform -translate-y-4 transition-transform group-hover:-translate-y-2 duration-500">
                                    <CardContent className="p-6 text-center">
                                        <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <p className="font-bold">Responsive</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-background/80 backdrop-blur transform translate-y-2 transition-transform group-hover:translate-y-0 duration-500">
                                    <CardContent className="p-6 text-center">
                                        <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <p className="font-bold">Fast</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-background/80 backdrop-blur transform -translate-y-2 transition-transform group-hover:translate-y-0 duration-500">
                                    <CardContent className="p-6 text-center">
                                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <p className="font-bold">Secure</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Development Process Section */}
            <section className="w-full py-12 md:py-24 bg-muted/40">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                            How We Work
                        </h2>
                        <p className="max-w-[800px] mx-auto text-muted-foreground text-lg">
                            A transparent, agile process designed to deliver results efficiently.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />

                        {/* Step 1 */}
                        <div className="bg-background p-6 rounded-lg border shadow-sm relative group hover:border-primary transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                            <h3 className="font-bold text-xl mb-2 mt-4 text-center">Discovery</h3>
                            <p className="text-center text-muted-foreground text-sm">
                                We meet to understand your business goals, requirements, and the problem you want to solve.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-background p-6 rounded-lg border shadow-sm relative group hover:border-primary transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                            <h3 className="font-bold text-xl mb-2 mt-4 text-center">Planning & Design</h3>
                            <p className="text-center text-muted-foreground text-sm">
                                We create a roadmap and design intuitive UIs that align with your brand and user needs.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-background p-6 rounded-lg border shadow-sm relative group hover:border-primary transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                            <h3 className="font-bold text-xl mb-2 mt-4 text-center">Development</h3>
                            <p className="text-center text-muted-foreground text-sm">
                                Our skilled team builds your solution using modern tech, with frequent updates and feedback loops.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-background p-6 rounded-lg border shadow-sm relative group hover:border-primary transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
                            <h3 className="font-bold text-xl mb-2 mt-4 text-center">Launch & Support</h3>
                            <p className="text-center text-muted-foreground text-sm">
                                We deploy your product and provide ongoing support to ensure it continues to perform perfectly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technologies Section */}
            <section className="w-full py-12 md:py-24 bg-background">
                <div className="container px-4 md:px-6 text-center">
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                            Technologies We Master
                        </h2>
                        <p className="text-muted-foreground">
                            We rely on a robust, modern technology stack to build future-proof solutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Tech Placeholders - Using Text for simplicity, could be icons */}
                        <div className="font-bold text-xl">React</div>
                        <div className="font-bold text-xl">Next.js</div>
                        <div className="font-bold text-xl">TypeScript</div>
                        <div className="font-bold text-xl">Node.js</div>
                        <div className="font-bold text-xl">Python</div>
                        <div className="font-bold text-xl">Flutter</div>
                        <div className="font-bold text-xl">PostgreSQL</div>
                        <div className="font-bold text-xl">MongoDB</div>
                        <div className="font-bold text-xl">Docker</div>
                        <div className="font-bold text-xl">AWS</div>
                        <div className="font-bold text-xl">Tailwind</div>
                        <div className="font-bold text-xl">Figma</div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-20 bg-primary text-primary-foreground">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                            Ready to Transform Your Business?
                        </h2>
                        <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                            Let's discuss how Gainux can help you achieve your goals with our
                            rapid development and expert solutions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-lg font-semibold">
                                <Link to="/request-service">
                                    Get a Free Consultation
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
}
