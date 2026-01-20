import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { user, profile, updateProfile } = useAuth();
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await updateProfile({ full_name: fullName });
            setMessage({ type: 'success', text: "Profile updated successfully!" });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Update your personal details here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {message && (
                                <Alert variant={message.type === 'error' ? "destructive" : "default"} className={message.type === 'success' ? "border-green-500 text-green-500" : ""}>
                                    <AlertDescription>{message.text}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>
                            Technical details about your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">User ID</Label>
                            <p className="font-mono text-sm">{user.id}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Last Sign In</Label>
                            <p className="text-sm">
                                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Provider</Label>
                            <p className="text-sm capitalize">{user.app_metadata.provider || "Email"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Role</Label>
                            <p className="text-sm capitalize font-medium">{profile?.role || "User"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Organization ID</Label>
                            <p className="text-sm font-mono text-muted-foreground">{profile?.org_id || "None"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
