
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, Users, Trophy, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export function About() {
    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title="About Us"
                description="Learn about Gainux, a leading software agency operated by BigBurry Hypersystems LLP. Our mission is to empower businesses through speed, innovation, and technical excellence."
                canonical="/about"
            />
            {/* Hero Section */}
            <section className="py-20 md:py-32 bg-muted/30">
                <div className="container px-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
                        Empowering Business Through <span className="text-primary">Innovation</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mb-4">
                        At Gainux, we blend speed, creativity, and technical excellence to build digital solutions that transform industries.
                    </p>
                    <p className="text-sm font-medium text-muted-foreground/80 uppercase tracking-widest">
                        A Brand Operated by BigBurry Hypersystems LLP
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="bg-primary/5 border-none">
                            <CardContent className="pt-6">
                                <Target className="h-12 w-12 text-primary mb-4" />
                                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    To democratize access to high-end software technology for businesses of all sizes. We believe in creating tools that are not just functional, but intuitive and enjoyable to use, enabling growth and efficiency.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-none">
                            <CardContent className="pt-6">
                                <Trophy className="h-12 w-12 text-primary mb-4" />
                                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    To be the global partner of choice for digital transformation, known for our ability to deliver complex solutions with unmatched speed and reliability, fostering a digital-first future.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-muted/50">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Our Core Values</h2>
                        <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                            The principles that guide every line of code we write and every partnership we build.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "Speed & Agility",
                                desc: "We move fast without breaking things. Rapid iteration is in our DNA."
                            },
                            {
                                icon: Shield,
                                title: "Reliability",
                                desc: "Robust, secure, and scalable solutions you can depend on 24/7."
                            },
                            {
                                icon: Users,
                                title: "Client-Centric",
                                desc: "Your success is our success. We work as an extension of your team."
                            },
                            {
                                icon: Heart,
                                title: "Passion",
                                desc: "We love what we do, and it shows in the quality of our work."
                            }
                        ].map((value, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <value.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-xl mb-2">{value.title}</h3>
                                <p className="text-muted-foreground">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats/Trust Section */}
            <section className="py-24">
                <div className="container px-4">
                    <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Build the Future?</h2>
                                <p className="text-lg opacity-90 mb-8">
                                    Whether you're a startup looking to launch or an enterprise seeking optimization, we have the expertise to help you succeed.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button variant="secondary" size="lg" asChild>
                                        <Link to="/contact">Contact Us</Link>
                                    </Button>
                                    <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                                        <Link to="/services">Explore Services</Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="text-center p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm">
                                    <div className="text-4xl font-bold mb-2">50+</div>
                                    <div className="text-sm opacity-90">Projects Delivered</div>
                                </div>
                                <div className="text-center p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm">
                                    <div className="text-4xl font-bold mb-2">98%</div>
                                    <div className="text-sm opacity-90">Client Retention</div>
                                </div>
                                <div className="text-center p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm">
                                    <div className="text-4xl font-bold mb-2">24/7</div>
                                    <div className="text-sm opacity-90">Support Active</div>
                                </div>
                                <div className="text-center p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm">
                                    <div className="text-4xl font-bold mb-2">100%</div>
                                    <div className="text-sm opacity-90">Commitment</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
