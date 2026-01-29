import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { companyService } from "@/modules/system/services/companyService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, ShieldCheck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AED', symbol: 'dh', name: 'UAE Dirham' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

const PLANS = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: 299,
        interval: 'month',
        description: 'Billed monthly',
        features: ['Full ERP Access', 'Unlimited Users', 'Priority Support']
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: 2999,
        interval: 'year',
        description: 'Billed annually',
        features: ['Full ERP Access', 'Unlimited Users', 'Priority Support']
    }
];

export default function OnboardingPage() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);

    // Org Details
    const [orgName, setOrgName] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [currencySymbol, setCurrencySymbol] = useState("₹");

    // Subscription
    const [selectedPlanId, setSelectedPlanId] = useState<string>("yearly");

    const [loading, setLoading] = useState(false);

    const handleCurrencyChange = (currCode: string) => {
        setCurrency(currCode);
        const matched = CURRENCIES.find(c => c.code === currCode);
        if (matched) {
            setCurrencySymbol(matched.symbol);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!orgName) {
                alert("Please enter an organization name.");
                return;
            }
            setStep(2);
        }
    };

    const handlePaymentAndCreate = async () => {
        if (!user) {
            alert("User not authenticated.");
            return;
        }

        const selectedPlan = PLANS.find(p => p.id === selectedPlanId);
        if (!selectedPlan) return;

        setLoading(true);

        // 1. Initialize Razorpay (Simulated or Real)
        // In a real scenario, we would call our backend to create a Razorpay Subscription/Order here.
        // For this implementation, we will simulate the "Subscription Creation" and open Razorpay.

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

        const options = {
            key: razorpayKey,
            amount: selectedPlan.price * 100, // Amount in paise
            currency: "INR",
            name: "Gainux ERP",
            description: `${selectedPlan.name} Subscription`,
            image: "/logo.png", // Use our logo
            handler: async function (response: any) {
                // Payment Success
                console.log("Payment successful", response);
                await createOrgWithSubscription(response.razorpay_payment_id || "simulated_pay_id");
            },
            prefill: {
                name: user.user_metadata?.full_name || "",
                email: user.email || "",
                contact: ""
            },
            theme: {
                color: "#2563eb"
            }
        };

        try {
            // Check if Razorpay is loaded
            if ((window as any).Razorpay) {
                const rzp1 = new (window as any).Razorpay(options);
                rzp1.open();
                setLoading(false); // Wait for user action
            } else {
                // Fallback for simulation if script fails or dev mode
                alert("Razorpay SDK not loaded. Simulating success...");
                await createOrgWithSubscription("simulated_pay_id");
            }
        } catch (error) {
            console.error("Payment initialization failed", error);
            setLoading(false);
            alert("Payment failed to initialize.");
        }
    };

    const createOrgWithSubscription = async (paymentId: string) => {
        setLoading(true);
        try {
            // Calculate expiry

            const expiry = new Date();
            if (selectedPlanId === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
            else expiry.setFullYear(expiry.getFullYear() + 1);

            await companyService.createOrganization({
                name: orgName,
                currency: currency || "INR",
                settings: {
                    currency_symbol: currencySymbol
                },
                subscription_plan: selectedPlanId as 'monthly' | 'yearly',
                subscription_status: 'active',
                subscription_expiry: expiry.toISOString(),
                razorpay_subscription_id: paymentId // Store payment ID or actual sub ID
            }, {
                id: user!.id,
                email: user!.email || "",
                full_name: user!.user_metadata?.full_name || ""
            });

            // Reload to reflect changes
            window.location.reload();
        } catch (error: any) {
            console.error("Failed to create organization", error);
            alert("Failed to create organization: " + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4">
            <Card className="max-w-lg w-full border-border/50 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-fit mb-4">
                        <img src="/logo.png" alt="Gainux ERP" className="h-12 w-auto" />
                    </div>
                    <CardTitle className="text-xl">
                        {step === 1 ? "Welcome to Gainux" : "Select Your Plan"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 ? "Let's set up your organization." : "Choose a subscription to activate your account."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="createOrgName">Organization Name</Label>
                                <Input
                                    id="createOrgName"
                                    placeholder="e.g. Acme Corp"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="createCurrency">Base Currency</Label>
                                    <Select value={currency} onValueChange={handleCurrencyChange}>
                                        <SelectTrigger id="createCurrency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {CURRENCIES.map((c) => (
                                                <SelectItem key={c.code} value={c.code}>
                                                    <span className="font-medium mr-2">{c.code}</span>
                                                    <span className="text-muted-foreground text-xs">({c.name})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="createCurrencySymbol">Symbol</Label>
                                    <Input
                                        id="createCurrencySymbol"
                                        value={currencySymbol}
                                        onChange={(e) => setCurrencySymbol(e.target.value)}
                                        placeholder="$"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {PLANS.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={cn(
                                            "cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-accent relative",
                                            selectedPlanId === plan.id ? "border-primary bg-primary/5" : "border-muted"
                                        )}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                    >
                                        {plan.id === 'yearly' && (
                                            <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                Save ~16%
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold">{plan.name}</h3>
                                            {selectedPlanId === plan.id && <Check className="h-4 w-4 text-primary" />}
                                        </div>
                                        <div className="mb-4">
                                            <span className="text-2xl font-bold">₹{plan.price}</span>
                                            <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                                            {plan.id === 'yearly' && (
                                                <p className="text-xs text-green-600 font-medium mt-1">
                                                    ₹249/month (billed annually)
                                                </p>
                                            )}
                                        </div>
                                        <ul className="space-y-2 text-sm">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                                    <Check className="h-3 w-3 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-muted/50 p-3 rounded-md flex items-start gap-2 text-sm text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                                <p>Secure payment via Razorpay. Auto-renew enabled. Cancel anytime.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step === 2 ? (
                        <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step === 1 ? (
                        <Button onClick={handleNext}>
                            Next Steps
                        </Button>
                    ) : (
                        <Button onClick={handlePaymentAndCreate} disabled={loading} className="w-full md:w-auto">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Subscribe & Create
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
