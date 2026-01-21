import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { companyService } from "../services/companyService";
import { MODULES } from "@/config/modules";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Save, Loader2 } from "lucide-react";
import type { RolePermissions, Organization } from "../types";

export function RolePermissionMatrix() {
    const { profile } = useAuth();
    const [permissions, setPermissions] = useState<RolePermissions>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [org, setOrg] = useState<Organization | null>(null);

    const ROLES = ['manager', 'user']; // Admin has full access by default, maybe not shown or disabled checked

    useEffect(() => {
        if (profile?.org_id) {
            loadPermissions(profile.org_id);
        }
    }, [profile]);

    const loadPermissions = async (orgId: string) => {
        setLoading(true);
        try {
            const orgData = await companyService.getOrganization(orgId);
            setOrg(orgData);
            setPermissions(orgData.settings?.permissions || {});
        } catch (error) {
            console.error("Failed to load permissions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (role: string, moduleId: string) => {
        setPermissions(prev => {
            const roleModules = prev[role] || [];
            const isEnabled = roleModules.includes(moduleId);

            let newRoleModules;
            if (isEnabled) {
                newRoleModules = roleModules.filter(id => id !== moduleId);
            } else {
                newRoleModules = [...roleModules, moduleId];
            }

            return {
                ...prev,
                [role]: newRoleModules
            };
        });
    };

    const handleSave = async () => {
        if (!org) return;
        setSaving(true);
        try {
            await companyService.updateOrganization(org.id, {
                settings: {
                    ...org.settings,
                    permissions: permissions
                }
            });
            alert("Role permissions updated successfully!");
        } catch (error) {
            console.error("Failed to save permissions", error);
            alert("Failed to save permissions.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Module Permissions
                </CardTitle>
                <CardDescription>
                    Control which modules each role can access. Admins have full access to all modules.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[300px]">Module</TableHead>
                                {ROLES.map(role => (
                                    <TableHead key={role} className="text-center capitalize w-[150px]">{role}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MODULES.filter(m => m.id !== 'system').map(module => (
                                <TableRow key={module.id}>
                                    <TableCell>
                                        <div className="font-medium">{module.name}</div>
                                        <div className="text-xs text-muted-foreground">{module.description}</div>
                                    </TableCell>
                                    {ROLES.map(role => {
                                        // Default Logic: check DB permissions first. If undefinedKey (not just empty array, but key missing), maybe default to ALL?
                                        // But here we rely on what is stored. If nothing stored, everything is disabled (empty array fallback).
                                        // To be user friendly, initially we might want to default to ALL if settings.permissions is undefined.
                                        // But the loadPermissions sets it to {} if undefined.
                                        // So default is "Disabled" for everything unless we explicitly enable defaults.
                                        // Let's improve loadPermissions to set defaults if empty?
                                        // Or just rely on user setting them.

                                        const checked = (permissions[role] || []).includes(module.id);

                                        return (
                                            <TableCell key={role} className="text-center">
                                                <div className="flex justify-center">
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={() => handleToggle(role, module.id)}
                                                    />
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Permissions
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
