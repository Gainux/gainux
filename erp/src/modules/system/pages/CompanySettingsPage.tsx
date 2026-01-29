import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { companyService } from "../services/companyService";
import type { Organization, Branch } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Building, MapPin, Globe, Mail, Phone, Save } from "lucide-react";

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
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
    { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal' },
    { code: 'OMR', symbol: 'OMR', name: 'Omani Rial' },
    { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
    { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
];

export default function CompanySettingsPage() {
    const { profile } = useAuth();
    const [org, setOrg] = useState<Organization | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [branchSaving, setBranchSaving] = useState(false);
    const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);

    // Editable fields
    const [orgName, setOrgName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [gstin, setGstin] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [currencySymbol, setCurrencySymbol] = useState("₹");
    const [taxId, setTaxId] = useState("");

    // Leave Policy
    const [paidLeaves, setPaidLeaves] = useState(0);
    const [sickLeaves, setSickLeaves] = useState(0);

    // Branch Form
    const [newBranchName, setNewBranchName] = useState("");
    const [newBranchCode, setNewBranchCode] = useState("");
    const [newBranchAddress, setNewBranchAddress] = useState("");
    const [isMainBranch, setIsMainBranch] = useState(false);

    useEffect(() => {
        if (profile?.org_id) {
            loadData(profile.org_id);
        } else {
            setLoading(false);
        }
    }, [profile]);

    const loadData = async (orgId: string) => {
        setLoading(true);
        try {
            const orgData = await companyService.getOrganization(orgId);
            setOrg(orgData);

            // Populate form fields
            setOrgName(orgData.name || "");
            setCurrency(orgData.currency || "INR");

            // Fix: Check settings for symbol, otherwise fallback to known symbol for currency
            const savedSymbol = orgData.settings?.currency_symbol;
            if (savedSymbol) {
                setCurrencySymbol(savedSymbol);
            } else {
                const matched = CURRENCIES.find(c => c.code === (orgData.currency || "INR"));
                setCurrencySymbol(matched?.symbol || "₹");
            }

            setTaxId(orgData.tax_id || "");

            // Populate Leave Policy from settings
            if (orgData.settings?.leave_policy) {
                setPaidLeaves(orgData.settings.leave_policy.paid_leaves || 0);
                setSickLeaves(orgData.settings.leave_policy.sick_leaves || 0);
            }

            // Extract from address JSONB if exists
            if (orgData.address) {
                setEmail(orgData.address.email || "");
                setPhone(orgData.address.phone || "");
                setAddress(orgData.address.street || "");
                setCity(orgData.address.city || "");
                setState(orgData.address.state || "");
                setPincode(orgData.address.pincode || "");
                setGstin(orgData.address.gstin || "");
            }

            const branchData = await companyService.getBranches(orgId);
            setBranches(branchData);
        } catch (error) {
            console.error("Failed to load company data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCurrencyChange = (currCode: string) => {
        setCurrency(currCode);
        const matched = CURRENCIES.find(c => c.code === currCode);
        if (matched) {
            setCurrencySymbol(matched.symbol);
        }
    };

    const handleSaveOrganization = async () => {
        if (!org) return;

        setSaving(true);
        try {
            await companyService.updateOrganization(org.id, {
                name: orgName,
                currency,
                tax_id: taxId,
                address: {
                    email,
                    phone,
                    street: address,
                    city,
                    state,
                    pincode,
                    gstin
                },
                settings: {
                    ...org.settings,
                    currency_symbol: currencySymbol,
                    leave_policy: {
                        paid_leaves: paidLeaves,
                        sick_leaves: sickLeaves
                    }
                }
            });

            alert("Organization settings saved successfully!");
            if (profile?.org_id) {
                loadData(profile.org_id); // Reload to get updated data
            }
        } catch (error) {
            console.error("Failed to save organization", error);
            alert("Failed to save organization settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateBranch = async () => {
        if (!newBranchName || !profile?.org_id) return;

        setBranchSaving(true);
        try {
            await companyService.createBranch({
                org_id: profile.org_id,
                name: newBranchName,
                code: newBranchCode,
                address: { street: newBranchAddress },
                is_main: isMainBranch
            });

            // Refresh branches
            const branchData = await companyService.getBranches(profile.org_id);
            setBranches(branchData);

            setIsBranchDialogOpen(false);
            setNewBranchName("");
            setNewBranchCode("");
            setNewBranchAddress("");
            setIsMainBranch(false);
            alert("Branch created successfully!");
        } catch (error: any) {
            console.error("Failed to create branch", error);
            alert("Failed to create branch: " + error.message);
        } finally {
            setBranchSaving(false);
        }
    };

    const handleCreateOrganization = async () => {
        if (!orgName) {
            alert("Please enter an organization name.");
            return;
        }

        setSaving(true);
        try {
            // 1. Create Organization
            await companyService.createOrganization({
                name: orgName,
                currency: currency || "INR",
                settings: {
                    currency_symbol: currencySymbol
                }
            });

            // 2. Reload to reflect changes (Profile is already updated by RPC)
            window.location.reload();
        } catch (error: any) {
            console.error("Failed to create organization", error);
            alert("Failed to create organization: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!org) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-muted/30 p-4">
            <Card className="max-w-md w-full border-border/50 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <Building className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Welcome to ERP</CardTitle>
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

    return (
        <div className="space-y-6 p-4 md:p-6 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your organization details and branch locations.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Organization Details */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            Organization Information
                        </CardTitle>
                        <CardDescription>Update your company details that appear on documents and invoices</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">Company Name *</Label>
                            <Input
                                id="orgName"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="Enter company name"
                            />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contact@company.com"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 1234567890"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Street address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="City"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="State"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                    id="pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="123456"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select value={currency} onValueChange={handleCurrencyChange}>
                                    <SelectTrigger id="currency">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {CURRENCIES.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                <div className="flex items-center justify-between w-full min-w-[120px]">
                                                    <span className="font-medium mr-2">{c.code}</span>
                                                    <span className="text-muted-foreground text-xs">{c.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currencySymbol">Symbol</Label>
                                <Input
                                    id="currencySymbol"
                                    value={currencySymbol}
                                    onChange={(e) => setCurrencySymbol(e.target.value)}
                                    placeholder="$"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxId">Tax ID</Label>
                                <div className="relative">
                                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="taxId"
                                        value={taxId}
                                        onChange={(e) => setTaxId(e.target.value)}
                                        placeholder="Tax ID"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gstin">GSTIN</Label>
                                <Input
                                    id="gstin"
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value)}
                                    placeholder="GSTIN"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSaveOrganization} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Leave Policy Settings */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            Leave Policy
                        </CardTitle>
                        <CardDescription>Configure annual leave allowances involved in payroll calculation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paidLeaves">Paid Leaves (per year)</Label>
                                <Input
                                    id="paidLeaves"
                                    type="number"
                                    min="0"
                                    value={paidLeaves}
                                    onChange={(e) => setPaidLeaves(Number(e.target.value))}
                                    placeholder="e.g. 12"
                                />
                                <p className="text-xs text-muted-foreground">Number of paid leaves allowed annually.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sickLeaves">Sick Leaves (per year)</Label>
                                <Input
                                    id="sickLeaves"
                                    type="number"
                                    min="0"
                                    value={sickLeaves}
                                    onChange={(e) => setSickLeaves(Number(e.target.value))}
                                    placeholder="e.g. 10"
                                />
                                <p className="text-xs text-muted-foreground">Number of sick leaves allowed annually.</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            {/* Save button already covered below or implicit? No, separate save for section or global?
                                The page has a save button inside the Organization Card. 
                                Better to have a unified save or separate. 
                                The user's existing code has a save button inside the "Organization Information" card. 
                                I should probably move the save button to be global or add one here.
                                For now, I will reuse the handleSaveOrganization and add a save button here too, or relying on the first one is bad UX if it's far away.
                                Let's add a save button here as well, calling the same function.
                             */}
                            <Button onClick={handleSaveOrganization} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Policy
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Branches */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Branches
                            </CardTitle>
                            <CardDescription>Manage office locations</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setIsBranchDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Add Branch
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-3">
                            {branches.map(branch => (
                                <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="font-medium flex items-center gap-2">
                                            {branch.name}
                                            {branch.is_main && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">HQ</Badge>}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono">{branch.code || 'NO-CODE'}</div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">Edit</Button>
                                </div>
                            ))}
                            {branches.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <MapPin className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-sm">No branches found.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Branch</DialogTitle>
                        <DialogDescription>
                            Create a new office location for your organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="branchName">Branch Name *</Label>
                            <Input
                                id="branchName"
                                value={newBranchName}
                                onChange={(e) => setNewBranchName(e.target.value)}
                                placeholder="Head Office"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="branchCode">Branch Code</Label>
                                <Input
                                    id="branchCode"
                                    value={newBranchCode}
                                    onChange={(e) => setNewBranchCode(e.target.value)}
                                    placeholder="HQ-001"
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isMain"
                                        checked={isMainBranch}
                                        onCheckedChange={(c) => setIsMainBranch(!!c)}
                                    />
                                    <Label htmlFor="isMain">Main Branch?</Label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="branchAddress">Address</Label>
                            <Input
                                id="branchAddress"
                                value={newBranchAddress}
                                onChange={(e) => setNewBranchAddress(e.target.value)}
                                placeholder="Branch address"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBranchDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateBranch} disabled={branchSaving || !newBranchName}>
                            {branchSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
