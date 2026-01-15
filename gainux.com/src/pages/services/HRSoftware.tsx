
import { Button } from "@/components/ui/button";
import { CheckCircle2, Code, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import hrImg from "@/assets/hr.png";

export function HRSoftware() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 bg-muted/30">
                <div className="container px-4 text-center">
                    <Code className="h-16 w-16 mx-auto mb-6 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">HR Software Solutions</h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                        Simplify your human resources management with powerful, automated tools for payroll, attendance, and more.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Manage Your Team Effectively</h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                                Our HR solutions reduce administrative burden, ensure compliance, and improve employee satisfaction. From onboarding to payroll, handle it all in one unified platform.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Automated Payroll Processing",
                                    "Attendance & Leave Management",
                                    "Employee Self-Service Portals",
                                    "Recruitment & Onboarding Workflows",
                                    "Performance Management Systems",
                                    "Document Management"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" className="mt-8">
                                <Link to="/request-service">Optimize Your HR <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                        <div className="rounded-xl overflow-hidden aspect-video border shadow-sm">
                            <img
                                src={hrImg}
                                alt="HR Software"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
