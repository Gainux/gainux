import { useState, useEffect } from "react";
import { Palette, Bell, Loader2, Blocks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { settingsService } from "@/services/settingsService";
import { useTheme } from "@/context/ThemeContext";
import { useModules } from "@/context/ModuleContext";
import { MODULES } from "@/config/modules";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { enabledModules, toggleModule } = useModules();
    const [loading, setLoading] = useState(true);
    const [organizationName, setOrganizationName] = useState("Gainux");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [gstin, setGstin] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [primaryColor, setPrimaryColor] = useState("blue");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [notifyInvoiceDue, setNotifyInvoiceDue] = useState(true);
    const [notifyDealWon, setNotifyDealWon] = useState(true);
    const [notifyNewLead, setNotifyNewLead] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await settingsService.getSettings();
            setOrganizationName(settings.organizationName);
            setEmail(settings.email || "");
            setPhone(settings.phone || "");
            setAddress(settings.address || "");
            setCity(settings.city || "");
            setState(settings.state || "");
            setPincode(settings.pincode || "");
            setGstin(settings.gstin || "");
            setPrimaryColor(settings.primaryColor);
            setEmailNotifications(settings.emailNotifications);
            setNotifyInvoiceDue(settings.notifyInvoiceDue);
            setNotifyDealWon(settings.notifyDealWon);
            setNotifyNewLead(settings.notifyNewLead);
        } catch (err: any) {
            console.error("Error loading settings:", err);
            // alert("Failed to load settings: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOrganization = async () => {
        try {
            setSaving(true);
            await settingsService.updateSettings({
                organizationName,
                email,
                phone,
                address,
                city,
                state,
                pincode,
                gstin,

            });
            alert("Organization settings saved successfully!");
        } catch (err: any) {
            console.error("Error saving settings:", err);
            alert("Failed to save settings: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTheme = async () => {
        try {
            setSaving(true);
            const darkMode = theme === "dark";
            await settingsService.updateSettings({
                darkMode,
                primaryColor,
            });
            alert("Theme settings saved successfully!");
        } catch (err: any) {
            console.error("Error saving theme:", err);
            alert("Failed to save theme: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        try {
            setSaving(true);
            await settingsService.updateSettings({
                emailNotifications,
                notifyInvoiceDue,
                notifyDealWon,
                notifyNewLead,
            });
            alert("Notification settings saved successfully!");
        } catch (err: any) {
            console.error("Error saving notifications:", err);
            alert("Failed to save notifications: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your organization settings and preferences
                </p>
            </div>

            <Tabs defaultValue="appearance" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="modules" className="flex items-center gap-2">
                        <Blocks className="h-4 w-4" />
                        Modules
                    </TabsTrigger>
                </TabsList>

                {/* Organization Settings */}
                <TabsContent value="organization" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Information</CardTitle>
                            <CardDescription>
                                Update your organization details that will appear on invoices and documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="orgName">Organization Name *</Label>
                                <Input
                                    id="orgName"
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    placeholder="Enter organization name"
                                />
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contact@company.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 1234567890"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Street address, building name, etc."
                                    rows={2}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
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

                            <div className="space-y-2">
                                <Label htmlFor="gstin">GSTIN</Label>
                                <Input
                                    id="gstin"
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value)}
                                    placeholder="22AAAAA0000A1Z5"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Your GST Identification Number (15 characters)
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveOrganization} disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theme</CardTitle>
                            <CardDescription>
                                Customize the appearance of the application
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="darkMode">Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Switch between light and dark theme
                                    </p>
                                </div>
                                <Switch
                                    id="darkMode"
                                    checked={theme === "dark"}
                                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Primary Color</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    {['blue', 'green', 'purple', 'red', 'orange', 'pink'].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`h-10 w-full rounded-md border-2 ${color === primaryColor ? 'border-primary' : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: `var(--${color}-500, ${color})` }}
                                            onClick={() => setPrimaryColor(color)}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Choose your preferred accent color
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveTheme} disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Manage how you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="emailNotif">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive email notifications for important updates
                                    </p>
                                </div>
                                <Switch
                                    id="emailNotif"
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Email me when:</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="invoiceDue" className="font-normal">
                                            An invoice is due
                                        </Label>
                                        <Switch
                                            id="invoiceDue"
                                            checked={notifyInvoiceDue}
                                            onCheckedChange={setNotifyInvoiceDue}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="dealWon" className="font-normal">
                                            A deal is won
                                        </Label>
                                        <Switch
                                            id="dealWon"
                                            checked={notifyDealWon}
                                            onCheckedChange={setNotifyDealWon}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="newLead" className="font-normal">
                                            A new lead is created
                                        </Label>
                                        <Switch
                                            id="newLead"
                                            checked={notifyNewLead}
                                            onCheckedChange={setNotifyNewLead}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveNotifications} disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Module Settings */}
                <TabsContent value="modules" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Module Management</CardTitle>
                            <CardDescription>
                                Enable or disable modules to customize your workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {MODULES.map((module) => (
                                <div key={module.id} className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">{module.name}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {module.description}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={enabledModules.includes(module.id)}
                                        onCheckedChange={() => toggleModule(module.id)}
                                        disabled={module.required}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
