import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Requirement } from "@/modules/crm/types";

interface RequirementsListProps {
    requirements: Requirement[];
    onUpdate: (requirements: Requirement[]) => Promise<void>;
}

export function RequirementsList({ requirements, onUpdate }: RequirementsListProps) {
    const [editingReq, setEditingReq] = useState<Requirement | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleAdd = async () => {
        if (!title.trim()) return;
        const newReq: Requirement = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description.trim() || "",
            priority: 'medium',
        };
        await onUpdate([...requirements, newReq]);
        setTitle("");
        setDescription("");
        setIsAddDialogOpen(false);
    };

    const handleEdit = async () => {
        if (!editingReq || !title.trim()) return;
        const updated = requirements.map(req =>
            req.id === editingReq.id
                ? { ...req, title: title.trim(), description: description.trim() || "" }
                : req
        );
        await onUpdate(updated);
        setEditingReq(null);
        setTitle("");
        setDescription("");
    };

    const handleDelete = async (reqId: string) => {
        const updated = requirements.filter(req => req.id !== reqId);
        await onUpdate(updated);
    };

    const openEditDialog = (req: Requirement) => {
        setEditingReq(req);
        setTitle(req.title);
        setDescription(req.description || "");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                </Button>
            </div>

            <div className="space-y-2">
                {requirements.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No requirements yet. Add one to get started.
                    </p>
                ) : (
                    requirements.map((req) => (
                        <Card key={req.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium">{req.title}</h4>
                                        {req.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {req.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEditDialog(req)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => handleDelete(req.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddDialogOpen || editingReq !== null} onOpenChange={(open) => {
                if (!open) {
                    setIsAddDialogOpen(false);
                    setEditingReq(null);
                    setTitle("");
                    setDescription("");
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingReq ? "Edit Requirement" : "Add Requirement"}</DialogTitle>
                        <DialogDescription>
                            {editingReq ? "Update the requirement details." : "Add a new requirement for this deal."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Get client approval on design"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Additional details about this requirement"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddDialogOpen(false);
                                    setEditingReq(null);
                                    setTitle("");
                                    setDescription("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={editingReq ? handleEdit : handleAdd}>
                                {editingReq ? "Save Changes" : "Add Requirement"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
