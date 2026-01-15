
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function RequestService() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setIsSubmitting(true);

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Prepare payload for FormSubmit.co
        const payload = {
            ...data,
            _subject: `New Service Request: ${data.service_type}`,
            _template: "table",
            _captcha: "false"
        };

        try {
            const response = await fetch("https://formsubmit.co/ajax/help@gainux.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Request received! We'll get back to you shortly.");
                form.reset();
            } else {
                toast.error("Something went wrong. Please try again or email us directly.");
            }
        } catch (error) {
            toast.error("Network error. Please contact us directly.");
            console.error("Form error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container py-12 md:py-24 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-4xl font-bold mb-6">Start Your Project</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Ready to transform your business? Fill out the form below to request a service
                        or get a quote. Our team will review your requirements and get back to you
                        within 24 hours.
                    </p>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">What happens next?</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="mt-1 bg-primary/10 p-1 rounded-full h-fit">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Free Consultation</h4>
                                    <p className="text-sm text-muted-foreground">We'll schedule a call to discuss your needs in detail.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 bg-primary/10 p-1 rounded-full h-fit">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Proposal & Quote</h4>
                                    <p className="text-sm text-muted-foreground">You'll receive a detailed proposal with timeline and pricing.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 bg-primary/10 p-1 rounded-full h-fit">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Project Kickoff</h4>
                                    <p className="text-sm text-muted-foreground">Once approved, we start development immediately.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Service Request Form</CardTitle>
                        <CardDescription>
                            Please provide as much detail as possible about your project.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" placeholder="John Doe" required disabled={isSubmitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" placeholder="john@company.com" required disabled={isSubmitting} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" disabled={isSubmitting} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="service-type">Service Type</Label>
                                <select
                                    id="service-type"
                                    name="service_type"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select a service...</option>
                                    <option value="web-development">Website Development</option>
                                    <option value="mobile-app">Mobile App Development</option>
                                    <option value="management-software">Management Software (ERP/CRM)</option>
                                    <option value="hr-software">HR Software Solutions</option>
                                    <option value="whatsapp-automation">WhatsApp Automation</option>
                                    <option value="business-automation">Business Automation</option>
                                    <option value="other">Other / Custom Request</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="details">Project Details</Label>
                                <Textarea
                                    id="details"
                                    name="details"
                                    placeholder="Tell us about your project goals, features, and timeline..."
                                    className="min-h-[120px]"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? "Sending Request..." : "Submit Request"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
