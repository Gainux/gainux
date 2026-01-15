import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import whatsappImg from "@/assets/whatsapp-automation.png";

export function WhatsappAutomation() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 bg-muted/30">
                <div className="container px-4 text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-6 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">WhatsApp Automation</h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                        Engage your customers instantly with automated WhatsApp chatbots, notifications, and marketing campaigns.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Connect Where They Are</h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                                With over 2 billion users, WhatsApp is the best place to connect with your customers. Our automation tools help you provide instant support, send updates, and drive sales 24/7.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Automated Customer Support (Chatbots)",
                                    "Order Updates & Notifications",
                                    "Marketing Broadcasts & Campaigns",
                                    "API Integration with CRM/ERP",
                                    "Interactive Buttons & Menus",
                                    "Multi-Agent Support Dashboard"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" className="mt-8">
                                <Link to="/request-service">Start Automating <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                        <div className="rounded-xl overflow-hidden aspect-video border shadow-sm">
                            <img
                                src={whatsappImg}
                                alt="WhatsApp Automation"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
