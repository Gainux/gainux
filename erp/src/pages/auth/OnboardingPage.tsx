import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { companyService } from "@/modules/system/services/companyService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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

export default function OnboardingPage() {
    const { user } = useAuth();
    const [orgName, setOrgName] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [currencySymbol, setCurrencySymbol] = useState("₹");
    const [saving, setSaving] = useState(false);

    const handleCurrencyChange = (currCode: string) => {
        setCurrency(currCode);
        const matched = CURRENCIES.find(c => c.code === currCode);
        if (matched) {
            setCurrencySymbol(matched.symbol);
        }
    };

    const handleCreateOrganization = async () => {
        if (!orgName) {
            alert("Please enter an organization name.");
            return;
        }

        if (!user) {
            alert("User not authenticated.");
            return;
        }

        setSaving(true);
        try {
            await companyService.createOrganization({
                name: orgName,
                currency: currency || "INR",
                settings: {
                    currency_symbol: currencySymbol
                }
            }, {
                id: user.id,
                email: user.email || "",
                full_name: user.user_metadata?.full_name || ""
            });

            // Reload to reflect changes (Profile is updated by RPC)
            window.location.reload();
        } catch (error: any) {
            console.error("Failed to create organization", error);
            alert("Failed to create organization: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4">
            <Card className="max-w-md w-full border-border/50 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-fit mb-4">
                        <img src="/logo.png" alt="Gainux ERP" className="h-12 w-auto" />
                    </div>
                    <CardTitle className="text-xl">Welcome to Gainux ERP</CardTitle>
                    <CardDescription>
                        Let's set up your organization to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
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
                    <p className="text-xs text-muted-foreground">
                        You can add more currencies later (Multi-currency support).
                    </p>
                    <Button
                        className="w-full mt-4"
                        onClick={handleCreateOrganization}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Setting up...
                            </>
                        ) : (
                            "Create Organization"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
