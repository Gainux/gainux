import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { SystemUser } from "../types";

interface UserDialogProps {
    user: SystemUser | null; // null means creating new user
    isOpen: boolean; // Managed by parent but good to have prop if needed
    onSave: (data: Partial<SystemUser> & { password?: string }) => void;
    onCancel: () => void;
}

export function UserDialog({ user, onSave, onCancel }: UserDialogProps) {
    // Initialize state directly from props since we use a key to force re-mounting
    const [role, setRole] = useState(user?.role?.toLowerCase() || "user");
    const [status, setStatus] = useState(user?.status?.toLowerCase() || "active");
    const [email, setEmail] = useState(user?.email || "");
    const [fullName, setFullName] = useState(user?.full_name || "");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: user?.id, // ID only exists if editing
            email,
            full_name: fullName,
            password: !user ? password : undefined, // Only send password if creating
            role: role as any,
            status: status as any
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!user} // Disable email edit for existing users (primary identifier)
                    className={user ? "bg-muted" : ""}
                    required
                    type="email"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
            </div>

            {!user && (
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(val: string) => setRole(val as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(val: string) => setStatus(val as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
