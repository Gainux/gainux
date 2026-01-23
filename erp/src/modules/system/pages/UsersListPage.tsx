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
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserCog, Plus, Trash2, Users } from "lucide-react";
import { userService } from "../services/userService";
import { UserDialog } from "../components/UserDialog";
import { RolePermissionMatrix } from "../components/RolePermissionMatrix";
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
        (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'destructive';
            case 'manager': return 'default'; // primary/blue
            default: return 'secondary'; // grey
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user accounts, roles, and access permissions.
                    </p>
                </div>
                <Button onClick={() => {
                    setEditingUser(null);
                    setDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <div className="rounded-md border mx-6 mb-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
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
                                            <TableCell colSpan={5} className="h-64 text-center">
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                                                        <Users className="h-8 w-8" />
                                                    </div>
                                                    <p className="text-lg font-medium">No users found</p>
                                                    <p className="text-sm">Try adding a new user or adjusting your search.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getRoleBadgeColor(user.role) as any} className="capitalize">
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 capitalize' : 'capitalize'}>
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2 lg:px-3"
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setDialogOpen(true);
                                                            }}
                                                        >
                                                            <UserCog className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => confirmDeleteUser(user)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    <RolePermissionMatrix />
                </TabsContent>
            </Tabs>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Update user details and access role.' : 'Create a new user account.'}
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
                        <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user <span className="font-medium text-foreground">{userToDelete?.email}</span>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteUserOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
