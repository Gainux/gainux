import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import businessImg from "@/assets/business-auto.png";

export function BusinessAutomation() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 bg-muted/30">
                <div className="container px-4 text-center">
                    <TrendingUp className="h-16 w-16 mx-auto mb-6 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">Business Process Automation</h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                        Replace repetitive manual tasks with efficient, automated digital workflows to save time and reduce errors.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Work Smarter, Not Harder</h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                                We analyze your existing workflows and implement automation solutions that increase productivity and visual accuracy. Focus on growing your business while our bots handle the busy work.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Workflow Analysis & Optimization",
                                    "Data Entry & Processing Automation",
                                    "Integration Between Different Software",
                                    "Automated Reporting & Analytics",
                                    "Document Processing (OCR)",
                                    "Custom Bot Development"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" className="mt-8">
                                <Link to="/request-service">Automate Your Success <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                        <div className="rounded-xl overflow-hidden aspect-video border shadow-sm">
                            <img
                                src={businessImg}
                                alt="Business Automation"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
