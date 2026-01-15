
import { Button } from "@/components/ui/button";
import { CheckCircle2, Smartphone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import mobileDevImg from "@/assets/mobile-dev.png";

export function MobileDevelopment() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 bg-muted/30">
                <div className="container px-4 text-center">
                    <Smartphone className="h-16 w-16 mx-auto mb-6 text-primary" />
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">Mobile App Development</h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                        Native and cross-platform mobile applications for iOS and Android that offer exceptional user experiences.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Apps That Users Love</h2>
                            <p className="text-muted-foreground mb-6 text-lg">
                                We design and develop mobile applications that are intuitive, fast, and feature-rich. Using modern technologies like Flutter and React Native, we deliver apps that work seamlessly across all devices.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "iOS & Android Development",
                                    "Cross-Platform Solutions (Flutter/React Native)",
                                    "Intuitive UI/UX Design",
                                    "Secure API Integration",
                                    "App Store Optimization & Deployment",
                                    "Real-time Updates & Notifications"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" className="mt-8">
                                <Link to="/request-service">Discuss Your App Idea <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                        <div className="rounded-xl overflow-hidden aspect-video border shadow-sm">
                            <img
                                src={mobileDevImg}
                                alt="Mobile App Development"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
