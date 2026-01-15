
import { Button } from "@/components/ui/button";
import { CheckCircle2, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import managementImg from "@/assets/managemet.png";

export function ManagementSoftware() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 bg-muted/30">
                <div className="container px-4 text-center">
                    <Briefcase className="h-16 w-16 mx-auto mb-6 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">Management Software (ERP & CRM)</h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                        Streamline your business operations with custom-built management solutions tailored to your workflows.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Efficiency at Scale</h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                                Off-the-shelf software often forces you to change how you work. We build custom ERP and CRM systems that fit your business like a glove, automating processes and providing actionable insights.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Custom ERP Development",
                                    "CRM Solutions & Integration",
                                    "Inventory & Stock Management",
                                    "Project & Task Management",
                                    "Sales & Lead Tracking",
                                    "Financial Reporting Dashboards"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" className="mt-8">
                                <Link to="/request-service">Streamline Your Business <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                        <div className="rounded-xl overflow-hidden aspect-video border shadow-sm">
                            <img
                                src={managementImg}
                                alt="Management Software"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
