
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
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
    Star,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/web-dev.png"; // Using web-dev as the main hero visual

// Simple Accordion Component for FAQ
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-muted last:border-0">
            <button
                className="flex items-center justify-between w-full py-4 text-left focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-medium hover:text-primary transition-colors">{question}</span>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <p className="text-muted-foreground">{answer}</p>
                </div>
            </div>
        </div>
    );
};

export function Home() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            <SEO
                title="Software Solutions for Everyone"
                description="Gainux offers premium web development, mobile apps, ERP software, and automation solutions. We empower startups and enterprises with rapid, high-quality digital products."
                canonical="/"
            />
            {/* Hero Section */}
            <section className="flex-1 py-12 md:py-24 lg:py-32 xl:py-48 bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
                <div className="container relative z-10 px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col space-y-4 text-center lg:text-left">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                    Software Solutions for <span className="text-primary">Everyone</span>
                                </h1>
                                <p className="mx-auto lg:mx-0 max-w-[700px] text-muted-foreground md:text-xl">
                                    From startups to enterprises, we empower your business with innovative technology.
                                    Websites, Mobile Apps, Automation, and Custom Software delivered with speed and precision.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
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
                        {/* Hero Image / Visual */}
                        <div className="relative group hidden lg:block">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border bg-background">
                                <img
                                    src={heroImg}
                                    alt="Digital Solutions"
                                    className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-105"
                                />
                                {/* Floating Badge */}
                                <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border shadow-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm">Trusted by Businesses</p>
                                        <div className="flex text-yellow-500 mt-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            <Star className="w-3 h-3 fill-current" />
                                            <Star className="w-3 h-3 fill-current" />
                                            <Star className="w-3 h-3 fill-current" />
                                            <Star className="w-3 h-3 fill-current" />
                                        </div>
                                    </div>
                                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                        Top Rated
                                    </div>
                                </div>
                            </div>
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

            {/* Testimonials Section */}
            <section className="w-full py-12 md:py-24 bg-muted/40">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                            What Our Clients Say
                        </h2>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl">
                            We take pride in delivering exceptional results for our partners.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-background border-none shadow-sm h-full">
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex text-yellow-500 mb-4">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <p className="text-muted-foreground mb-6 flex-1">
                                    "Gainux transformed our manual processes into a seamless automated workflow. The team is highly professional and delivered ahead of schedule."
                                </p>
                                <div>
                                    <p className="font-bold">CEO</p>
                                    <p className="text-sm text-muted-foreground">Logistics Company</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-background border-none shadow-sm h-full">
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex text-yellow-500 mb-4">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <p className="text-muted-foreground mb-6 flex-1">
                                    "The mobile app they built for us has incredible performance and a 4.8-star rating on the store. Exceptional quality work."
                                </p>
                                <div>
                                    <p className="font-bold">Founder</p>
                                    <p className="text-sm text-muted-foreground">Retail Startup</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-background border-none shadow-sm h-full">
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex text-yellow-500 mb-4">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <p className="text-muted-foreground mb-6 flex-1">
                                    "Fast implementation and great post-launch support. Highly recommended for anyone looking for custom ERP solutions."
                                </p>
                                <div>
                                    <p className="font-bold">Director</p>
                                    <p className="text-sm text-muted-foreground">Manufacturing Firm</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Comprehensive Services Section */}
            <section className="w-full py-12 md:py-24 bg-background">
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
                        <Card className="bg-muted/50 border-none hover:bg-muted transition-colors">
                            <CardHeader>
                                <Globe className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">Website Development</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Stunning, responsive, and high-performance websites. From simple landing pages
                                    to complex e-commerce platforms and web applications.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Responsive Design</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> SEO Optimized</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Fast Loading</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 2 */}
                        <Card className="bg-muted/50 border-none hover:bg-muted transition-colors">
                            <CardHeader>
                                <Smartphone className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">Mobile App Development</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Native and cross-platform mobile apps for iOS and Android.
                                    We build intuitive, feature-rich apps that users love.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> iOS & Android</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Flutter & React Native</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> User-Centric UI</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 3 */}
                        <Card className="bg-muted/50 border-none hover:bg-muted transition-colors">
                            <CardHeader>
                                <Briefcase className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">Management Software</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Custom ERP, CRM, and business management tools tailored to your specific workflows.
                                    Streamline operations efficiently.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Custom ERP/CRM</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Inventory Management</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Real-time Analytics</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 4 */}
                        <Card className="bg-muted/50 border-none hover:bg-muted transition-colors">
                            <CardHeader>
                                <Layout className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">HR Software</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Complete HRMS to handle payroll, attendance, recruitment, and employee performance efficiently.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Payroll Automation</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Attendance Tracking</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Employee Portals</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 5 */}
                        <Card className="bg-muted/50 border-none hover:bg-muted transition-colors">
                            <CardHeader>
                                <MessageSquare className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">WhatsApp Automation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Leverage WhatsApp Business API for automated customer support, marketing notifications, and chatbots.
                                </p>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> 24/7 Chatbots</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Bulk Notifications</li>
                                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> API Integration</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Service 6 */}
                        <Card className="bg-muted/50 border-none hover:bg-muted transition-colors">
                            <CardHeader>
                                <Zap className="h-12 w-12 mb-4 text-primary" />
                                <CardTitle className="text-xl">Business Automation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Identify and automate repetitive manual tasks to save time and reduce errors.
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
                        {/* Tech Placeholders - Using Text for simplicity */}
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">React</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">Next.js</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">TypeScript</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">Node.js</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">Python</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">Flutter</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">PostgreSQL</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">MongoDB</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">Docker</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">AWS</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">Tailwind</div>
                        <div className="font-bold text-xl hover:text-primary transition-colors cursor-default">Figma</div>
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
                        {/* Steps (Same as before) */}
                        <div className="bg-background p-6 rounded-lg border shadow-sm relative group hover:border-primary transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                            <h3 className="font-bold text-xl mb-2 mt-4 text-center">Discovery</h3>
                            <p className="text-center text-muted-foreground text-sm">
                                We meet to understand your business goals, requirements, and the problem you want to solve.
                            </p>
                        </div>
                        <div className="bg-background p-6 rounded-lg border shadow-sm relative group hover:border-primary transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                            <h3 className="font-bold text-xl mb-2 mt-4 text-center">Planning & Design</h3>
                            <p className="text-center text-muted-foreground text-sm">
                                We create a roadmap and design intuitive UIs that align with your brand.
                            </p>
                        </div>
                        <div className="bg-background p-6 rounded-lg border shadow-sm relative group hover:border-primary transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                            <h3 className="font-bold text-xl mb-2 mt-4 text-center">Development</h3>
                            <p className="text-center text-muted-foreground text-sm">
                                Our skilled team builds your solution using modern tech, with frequent updates.
                            </p>
                        </div>
                        <div className="bg-background p-6 rounded-lg border shadow-sm relative group hover:border-primary transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
                            <h3 className="font-bold text-xl mb-2 mt-4 text-center">Launch & Support</h3>
                            <p className="text-center text-muted-foreground text-sm">
                                We deploy your product and provide ongoing support to ensure it continues to perform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="w-full py-12 md:py-24 bg-background">
                <div className="container px-4 md:px-6 max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground">
                            Got questions? We have answers.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <FAQItem
                            question="How long does a typical project take?"
                            answer="Timelines vary by complexity. A standard website takes 1-2 weeks, while complex custom software may take 4-8 weeks. We provide a detailed timeline during the discovery phase."
                        />
                        <FAQItem
                            question="Do you provide post-launch support?"
                            answer="Yes! We include a free support period with every project to handle bugs or minor tweaks. We also offer dedicated maintenance packages for long-term updates and security."
                        />
                        <FAQItem
                            question="What technologies do you use?"
                            answer="We specialize in the MERN stack (MongoDB, Express, React, Node.js), Next.js, Flutter for mobile, and Python for automation. We choose the best tech for your specific needs."
                        />
                        <FAQItem
                            question="Do you sign NDAs?"
                            answer="Absolutely. We respect your intellectual property and are happy to sign a Non-Disclosure Agreement (NDA) before discussing sensitive project details."
                        />
                        <FAQItem
                            question="Where is your team located?"
                            answer="We are based in Kerala, India, but we serve clients globally. We are accustomed to working across different time zones to ensure smooth communication."
                        />
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

