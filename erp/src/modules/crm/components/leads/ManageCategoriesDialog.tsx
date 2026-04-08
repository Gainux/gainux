import { useState, useEffect } from "react";
import { crmService } from "@/modules/crm/services/crmService";
import type { LeadCategory, LeadLocation } from "@/modules/crm/types";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Pencil, Trash2, ChevronRight, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
    '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
];

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onChanged: () => void;
}

export function ManageCategoriesDialog({ open, onOpenChange, onChanged }: Props) {
    const [categories, setCategories] = useState<LeadCategory[]>([]);
    const [locations, setLocations] = useState<LeadLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCat, setExpandedCat] = useState<string | null>(null);

    // Category form state
    const [catName, setCatName] = useState('');
    const [catColor, setCatColor] = useState(PRESET_COLORS[0]);
    const [editingCat, setEditingCat] = useState<LeadCategory | null>(null);
    const [catSaving, setCatSaving] = useState(false);

    // Location form state
    const [locName, setLocName] = useState('');
    const [editingLoc, setEditingLoc] = useState<LeadLocation | null>(null);
    const [locSaving, setLocSaving] = useState(false);
    const [addingLocFor, setAddingLocFor] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [cats, locs] = await Promise.all([
                crmService.getLeadCategories(),
                crmService.getLeadLocations(),
            ]);
            setCategories(cats);
            setLocations(locs);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (open) load(); }, [open]);

    const locsFor = (catId: string) => locations.filter(l => l.categoryId === catId);

    // --- Category handlers ---
    const startEditCat = (cat: LeadCategory) => {
        setEditingCat(cat);
        setCatName(cat.name);
        setCatColor(cat.color);
        setExpandedCat(cat.id);
    };

    const cancelCat = () => { setEditingCat(null); setCatName(''); setCatColor(PRESET_COLORS[0]); };

    const saveCat = async () => {
        if (!catName.trim()) return;
        setCatSaving(true);
        try {
            if (editingCat) {
                const updated = await crmService.updateLeadCategory(editingCat.id, { name: catName.trim(), color: catColor });
                setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await crmService.createLeadCategory(catName.trim(), catColor);
                setCategories(prev => [...prev, created]);
                setExpandedCat(created.id);
            }
            cancelCat();
            onChanged();
        } finally {
            setCatSaving(false);
        }
    };

    const deleteCat = async (cat: LeadCategory) => {
        if (!confirm(`Delete category "${cat.name}"? All its locations will also be deleted.`)) return;
        await crmService.deleteLeadCategory(cat.id);
        setCategories(prev => prev.filter(c => c.id !== cat.id));
        setLocations(prev => prev.filter(l => l.categoryId !== cat.id));
        onChanged();
    };

    // --- Location handlers ---
    const startAddLoc = (catId: string) => {
        setAddingLocFor(catId);
        setEditingLoc(null);
        setLocName('');
        setExpandedCat(catId);
    };

    const startEditLoc = (loc: LeadLocation) => {
        setEditingLoc(loc);
        setLocName(loc.name);
        setAddingLocFor(loc.categoryId);
        setExpandedCat(loc.categoryId);
    };

    const cancelLoc = () => { setEditingLoc(null); setLocName(''); setAddingLocFor(null); };

    const saveLoc = async () => {
        if (!locName.trim() || !addingLocFor) return;
        setLocSaving(true);
        try {
            if (editingLoc) {
                const updated = await crmService.updateLeadLocation(editingLoc.id, locName.trim());
                setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
            } else {
                const created = await crmService.createLeadLocation(addingLocFor, locName.trim());
                setLocations(prev => [...prev, created]);
            }
            cancelLoc();
            onChanged();
        } finally {
            setLocSaving(false);
        }
    };

    const deleteLoc = async (loc: LeadLocation) => {
        if (!confirm(`Delete location "${loc.name}"?`)) return;
        await crmService.deleteLeadLocation(loc.id);
        setLocations(prev => prev.filter(l => l.id !== loc.id));
        onChanged();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Manage Categories & Locations</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {/* Add new category form */}
                        {!editingCat && (
                            <div className="flex gap-2 items-center p-3 border rounded-lg bg-muted/30">
                                <div className="flex gap-1 flex-shrink-0">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={cn("w-4 h-4 rounded-full border-2 transition-transform", catColor === c ? 'border-foreground scale-110' : 'border-transparent')}
                                            style={{ background: c }}
                                            onClick={() => setCatColor(c)}
                                        />
                                    ))}
                                </div>
                                <Input
                                    placeholder="New category name…"
                                    value={catName}
                                    onChange={e => setCatName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && saveCat()}
                                    className="h-8 text-sm"
                                />
                                <Button size="sm" onClick={saveCat} disabled={!catName.trim() || catSaving} className="shrink-0">
                                    {catSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}

                        {categories.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No categories yet. Add one above.</p>
                        )}

                        {categories.map(cat => (
                            <div key={cat.id} className="border rounded-lg overflow-hidden">
                                {/* Category row */}
                                {editingCat?.id === cat.id ? (
                                    <div className="flex gap-2 items-center p-3 bg-muted/30">
                                        <div className="flex gap-1 flex-shrink-0">
                                            {PRESET_COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    className={cn("w-4 h-4 rounded-full border-2 transition-transform", catColor === c ? 'border-foreground scale-110' : 'border-transparent')}
                                                    style={{ background: c }}
                                                    onClick={() => setCatColor(c)}
                                                />
                                            ))}
                                        </div>
                                        <Input value={catName} onChange={e => setCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveCat()} className="h-8 text-sm" autoFocus />
                                        <Button size="sm" onClick={saveCat} disabled={catSaving}>
                                            {catSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={cancelCat}>✕</Button>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/30 select-none"
                                        onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                                    >
                                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                                        <span className="font-medium text-sm flex-1">{cat.name}</span>
                                        <span className="text-xs text-muted-foreground">{locsFor(cat.id).length} locations</span>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); startEditCat(cat); }}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={e => { e.stopPropagation(); deleteCat(cat); }}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                        {expandedCat === cat.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                )}

                                {/* Locations */}
                                {expandedCat === cat.id && (
                                    <div className="border-t bg-muted/10">
                                        {locsFor(cat.id).map(loc => (
                                            <div key={loc.id} className="border-b last:border-b-0">
                                                {editingLoc?.id === loc.id ? (
                                                    <div className="flex gap-2 items-center px-4 py-2">
                                                        <Input value={locName} onChange={e => setLocName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveLoc()} className="h-7 text-sm" autoFocus />
                                                        <Button size="sm" onClick={saveLoc} disabled={locSaving}>
                                                            {locSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={cancelLoc}>✕</Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-muted/20">
                                                        <span className="text-muted-foreground text-xs">└</span>
                                                        <span className="text-sm flex-1">{loc.name}</span>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEditLoc(loc)}>
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => deleteLoc(loc)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add location row */}
                                        {addingLocFor === cat.id && !editingLoc ? (
                                            <div className="flex gap-2 items-center px-4 py-2">
                                                <span className="text-muted-foreground text-xs">└</span>
                                                <Input placeholder="Location name…" value={locName} onChange={e => setLocName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveLoc()} className="h-7 text-sm" autoFocus />
                                                <Button size="sm" onClick={saveLoc} disabled={!locName.trim() || locSaving}>
                                                    {locSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={cancelLoc}>✕</Button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                className="w-full text-left px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 flex items-center gap-1"
                                                onClick={() => startAddLoc(cat.id)}
                                            >
                                                <Plus className="h-3 w-3" /> Add location
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
