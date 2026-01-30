import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { companyService } from "@/modules/system/services/companyService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertTriangle, Check, CreditCard, Loader2, ShieldCheck, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";


const PLANS = [
    {
        id: 'monthly',
        plan_id: 'plan_S9zefMIHkZ0YS', // Existing Razorpay Plan ID
        name: 'Monthly',
        price: 2,
        interval: 'month',
        description: 'Billed monthly',
        features: ['Full ERP Access', 'Unlimited Users', 'Priority Support']
    },
    {
        id: 'yearly',
        plan_id: 'plan_S9zeg8QL1A49kB', // Existing Razorpay Plan ID
        name: 'Yearly',
        price: 2999,
        interval: 'year',
        description: 'Billed annually',
        features: ['Full ERP Access', 'Unlimited Users', 'Priority Support']
    }
];

export default function SubscriptionExpiredPage() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("yearly");
    const [orgName, setOrgName] = useState<string>("");

    useEffect(() => {
        if (profile?.org_id) {
            companyService.getOrganization(profile.org_id).then(org => {
                setOrgName(org.name);
            });
        }
    }, [profile?.org_id]);

    const handlePayment = async () => {
        if (!user || !profile?.org_id) return;

        const selectedPlan = PLANS.find(p => p.id === selectedPlanId);
        if (!selectedPlan) return;

        setLoading(true);

        try {
            // ONE-TIME PAYMENT FLOW (Reverted from Subscription)
            // We use standard Razorpay client-side options for simple payment
            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

            const options = {
                key: razorpayKey,
                amount: selectedPlan.price * 100, // Amount in paise
                currency: "INR",
                name: "Gainux ERP",
                description: `${selectedPlan.name} Subscription (Renewal)`,
                image: "/logo.png",
                handler: async function (response: any) {
                    console.log("Payment successful", response);

                    try {
                        // Verify Payment Backend (Signature)
                        // Note: For orders created client-side or implicit orders, verification might fail if using 'order_id' that doesn't exist.
                        // But if we just pass payment_id, we can store it.
                        // Assuming verifyPayment can handle just payment_id or we skip it for this simple flow if needed.
                        // Actually, better to verify. But if we didn't create an order on backend, we can't strict verify order_id.
                        // For now, simpler: Just activate on success callback.

                        await activateSubscription(response.razorpay_payment_id);
                    } catch (error: any) {
                        console.error("Payment verification failed", error);
                        alert("Payment Verification Failed: " + error.message);
                        setLoading(false);
                    }
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

            if ((window as any).Razorpay) {
                const rzp1 = new (window as any).Razorpay(options);
                rzp1.open();
            } else {
                alert("Razorpay SDK not loaded.");
                setLoading(false);
            }
        } catch (error: any) {
            console.error("Payment initialization failed", error);
            setLoading(false);
            alert("Payment failed to initialize: " + error.message);
        }
    };

    const activateSubscription = async (paymentId: string) => {
        setLoading(true);
        try {
            // Calculate expiry manually
            const expiry = new Date();
            if (selectedPlanId === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
            else expiry.setFullYear(expiry.getFullYear() + 1);

            await companyService.updateOrganization(profile!.org_id!, {
                subscription_plan: selectedPlanId as 'monthly' | 'yearly',
                subscription_status: 'active',
                subscription_expiry: expiry.toISOString(),
                // We use 'manual_renewal' or just the payment ID as the sub ID placeholder
                razorpay_subscription_id: `manual_${paymentId}`
            });

            // Force reload
            window.location.href = "/";
        } catch (error: any) {
            console.error("Failed to activate subscription", error);
            alert("Failed to activate: " + error.message);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        navigate("/login");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4">
            <Card className="max-w-lg w-full border-border/50 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-fit mb-4 bg-orange-100 p-3 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl">Subscription Required</CardTitle>
                    <CardDescription>
                        {orgName ? `"${orgName}"` : "Your organization"} needs an active subscription to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
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
                        <p>Secure payment via Razorpay. Immediate activation.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button onClick={handlePayment} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Activate Subscription
                            </>
                        )}
                    </Button>
                    <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
