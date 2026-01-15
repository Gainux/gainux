import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserCog, Plus, Trash2 } from "lucide-react";
import { userService } from "../services/userService";
import { UserDialog } from "../components/UserDialog";
import type { SystemUser } from "../types";

export default function UsersListPage() {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteUserOpen, setDeleteUserOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async (data: Partial<SystemUser>) => {
        try {
            if (data.id) {
                // Update existing
                if (editingUser?.role !== data.role) {
                    await userService.updateUserRole(data.id, data.role as string);
                }
                if (editingUser?.status !== data.status) {
                    await userService.updateUserStatus(data.id, data.status as string);
                }
                // Also could update name/email if service supported it, but we focused on role/status

                setUsers(users.map(u => u.id === data.id ? { ...u, ...data } as SystemUser : u));
            } else {
                // Create new
                const newUser = await userService.createUser(data);
                setUsers([newUser, ...users]);
            }

            setDialogOpen(false);
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to save user", error);
        }
    };



    const confirmDeleteUser = (user: SystemUser) => {
        setUserToDelete(user);
        setDeleteUserOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await userService.deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setDeleteUserOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'destructive';
            case 'manager': return 'default'; // primary/blue
            default: return 'secondary'; // grey
        }
    };

    return (
        <div className="flex-1 h-[calc(100vh-4rem)] p-8 pt-6 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Users</h2>
                    <p className="text-muted-foreground">
                        Manage user access and roles.
                    </p>
                </div>
                <Button onClick={() => {
                    setEditingUser(null);
                    setDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.fullName || "N/A"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeColor(user.role) as any}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={user.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingUser(user);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <UserCog className="h-4 w-4 mr-2" />
                                            Manage
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => confirmDeleteUser(user)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Update user details and role.' : 'Create a new system user.'}
                        </DialogDescription>
                    </DialogHeader>
                    <UserDialog
                        user={editingUser}
                        isOpen={dialogOpen}
                        onSave={handleSaveUser}
                        onCancel={() => setDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the user
                            from the system listings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteUserOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
