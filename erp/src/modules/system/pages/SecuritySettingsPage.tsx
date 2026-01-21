import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { auditService } from "../services/auditService";
import type { AuditLog } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key, Smartphone, AlertCircle, CheckCircle, Loader2, LogOut } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function SecuritySettingsPage() {
    const { profile, user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Activity State
    const [loginHistory, setLoginHistory] = useState<AuditLog[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        if (profile?.org_id) {
            loadLoginHistory(profile.org_id);
        }
    }, [profile]);

    const loadLoginHistory = async (orgId: string) => {
        setHistoryLoading(true);
        try {
            // Fetch logs for current user only, specifically login actions
            // Note: auditService.getLogs fetches for Org. We'd filter client side or need a new service method for "my logs".
            // For now, let's use the existing getting logs and filter by user_id = current user (privacy) and action = login
            // Or better, let's just fetch all org logs and filter logs where user_id matches

            const logs = await auditService.getLogs(orgId, 20); // Get last 20
            const myLogins = logs.filter(l => l.user_id === user?.id && l.action.toLowerCase() === 'login');
            setLoginHistory(myLogins);
        } catch (error) {
            console.error("Failed to load activity", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setPasswordSuccess("Password updated successfully");
            setNewPassword("");
            setConfirmPassword("");
            setCurrentPassword("");
        } catch (error: any) {
            setPasswordError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 pb-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Security & Access</h1>
                <p className="text-muted-foreground">
                    Manage your account security and monitor access activity.
                </p>
            </div>

            <Tabs defaultValue="password" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="password">Password & Auth</TabsTrigger>
                    <TabsTrigger value="activity">Login Activity</TabsTrigger>
                    <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
                </TabsList>

                {/* Password Change Tab */}
                <TabsContent value="password">
                    <Card className="max-w-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                Change Password
                            </CardTitle>
                            <CardDescription>
                                Ensure your account is secure by using a strong password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {passwordError && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {passwordError}
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    {passwordSuccess}
                                </div>
                            )}

                            {/* Note: Supabase doesn't require current password for update if logged in, but good UI practice usually asks. 
                                Only New Password needed for API though. We'll skip "Current Password" verification for simplicity or 
                                add it if re-auth flow needed. For basic, just New Password. */}
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handlePasswordChange} disabled={loading || !newPassword}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Login Activity Tab */}
                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Recent Login History
                            </CardTitle>
                            <CardDescription>
                                Monitor when and where your account was accessed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {historyLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : loginHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {loginHistory.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-primary/10 rounded-full">
                                                    <Shield className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Login Successful</p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {/* Mock IP/Device since we don't store it yet */}
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    Current Device
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Shield className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p>No recent login history found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Active Sessions Tab */}
                <TabsContent value="sessions">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-primary" />
                                Active Sessions
                            </CardTitle>
                            <CardDescription>
                                Devices currently logged into your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Static/Current Session representation */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <Smartphone className="h-4 w-4 text-green-700" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-green-900">Current Session</p>
                                                <Badge className="bg-green-600 hover:bg-green-600 text-[10px]">Active Now</Badge>
                                            </div>
                                            <p className="text-xs text-green-700 mt-0.5">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Sign out button conceptually */}
                                    {/* <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                    </Button> */}
                                </div>
                                <p className="text-xs text-muted-foreground px-1">
                                    Note: Complete session management requires advanced backend configuration. Only the current session is shown.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
