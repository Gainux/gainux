import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
    const { user, profile, updateProfile } = useAuth();
    const [fullName, setFullName] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            await updateProfile({ full_name: fullName });
            setMessage({ type: 'success', text: "Profile updated successfully!" });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    if (!user) return null;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">Profile</h2>
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
                                    value={profile?.full_name || fullName}
                                    readOnly
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Profile details are managed by system administrators.
                                </p>
                            </div>
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
                            <Label className="text-xs text-muted-foreground">Role</Label>
                            <p className="text-sm capitalize font-medium">{profile?.role || "User"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Organization ID</Label>
                            <p className="text-sm font-mono text-muted-foreground">{profile?.org_id || "None"}</p>
                        </div>

                        {/* Show note if this is an Employee account using fallback */}
                        {profile?.role === 'employee' && !profile.id && (
                            <div className="pt-4 border-t">
                                <p className="text-xs text-muted-foreground">
                                    * This is an Employee account. Some details are managed by your administrator.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
