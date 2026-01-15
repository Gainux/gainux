
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

export function Contact() {
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
            _subject: `New Contact Inquiry from ${data.first_name} ${data.last_name}`,
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
                toast.success("Message sent successfully! We'll be in touch soon.");
                form.reset();
            } else {
                toast.error("Something went wrong. Please try again or email us directly.");
            }
        } catch (error) {
            toast.error("Network error. Please help@gainux.com directly.");
            console.error("Form error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title="Contact Us"
                description="Get in touch with Gainux. Call us, email us, or visit our office in Angamaly, Kerala. We are ready to start your next software project."
                canonical="/contact"
            />
            {/* Hero Section */}
            <section className="py-20 bg-muted/30">
                <div className="container px-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">Get in Touch</h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                        Have a question, suggestion, or just want to say hello? We'd love to hear from you.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container px-4">
                    <div className="grid lg:grid-cols-2 gap-12">

                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                                <p className="text-muted-foreground mb-8">
                                    Reach out to us through any of these channels. Our support team is available 24/7 to assist you.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <Card>
                                    <CardContent className="pt-6 flex flex-col items-center text-center">
                                        <div className="bg-primary/10 p-3 rounded-full mb-4">
                                            <Mail className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Email Us</h3>
                                        <p className="text-sm text-muted-foreground">info@gainux.com</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6 flex flex-col items-center text-center">
                                        <div className="bg-primary/10 p-3 rounded-full mb-4">
                                            <Phone className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Call Us</h3>
                                        <p className="text-sm text-muted-foreground">+91 80751 07480</p>
                                        <p className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm IST</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6 flex flex-col items-center text-center">
                                        <div className="bg-primary/10 p-3 rounded-full mb-4">
                                            <MapPin className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Visit Us</h3>
                                        <p className="text-sm text-muted-foreground px-4">
                                            Old Market Road<br />
                                            Angamaly, Kerala
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6 flex flex-col items-center text-center">
                                        <div className="bg-primary/10 p-3 rounded-full mb-4">
                                            <Clock className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2">Working Hours</h3>
                                        <p className="text-sm text-muted-foreground">Monday - Friday</p>
                                        <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* FAQ Teaser */}
                            <div className="bg-muted/30 p-6 rounded-xl border">
                                <div className="flex items-start gap-4">
                                    <div className="bg-background p-2 rounded-full border shadow-sm mt-1">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Looking to start a project?</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            If you have a project requirement or need a quote, please use our dedicated service request form for a faster response.
                                        </p>
                                        <Button variant="link" className="p-0 h-auto font-semibold text-primary" asChild>
                                            <a href="/request-service">Go to Service Request →</a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we'll get back to you within 24 hours.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first-name">First name</Label>
                                            <Input id="first-name" name="first_name" placeholder="John" required disabled={isSubmitting} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last-name">Last name</Label>
                                            <Input id="last-name" name="last_name" placeholder="Doe" required disabled={isSubmitting} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" placeholder="john@company.com" required disabled={isSubmitting} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" name="subject" placeholder="What is this regarding?" required disabled={isSubmitting} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            placeholder="Type your message here..."
                                            className="min-h-[150px]"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </section>
        </div>
    );
}
