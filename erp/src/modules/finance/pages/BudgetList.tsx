
import React, { useEffect, useState } from 'react';
import { useModules } from '@/context/ModuleContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { budgetService } from '../services/budgetService';
import type { Budget } from '../types';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const budgetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    description: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function BudgetList() {
    const { profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Fallback or wait for profile
    const orgId = profile?.org_id;

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            name: '',
            startDate: '',
            endDate: '',
            description: ''
        }
    });

    useEffect(() => {
        if (!authLoading && orgId) {
            loadBudgets();
        } else if (!authLoading && !orgId) {
            setLoading(false); // No org, stop loading
        }
    }, [authLoading, orgId]);

    const loadBudgets = async () => {
        if (!orgId) return;
        try {
            setLoading(true);
            // TODO: Get real orgId from context
            const data = await budgetService.getBudgets(orgId);
            setBudgets(data);
        } catch (error) {
            console.error('Failed to fetch budgets', error);
            toast.error('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: BudgetFormValues) => {
        if (!orgId) {
            toast.error("Organization not found");
            return;
        }

        try {
            await budgetService.createBudget({
                ...values,
                org_id: orgId
            });
            toast.success('Budget created successfully');
            setIsCreateOpen(false);
            form.reset();
            loadBudgets();
        } catch (error) {
            console.error('Failed to create budget', error);
            toast.error('Failed to create budget');
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
                    <p className="text-muted-foreground">Manage financial budgets and track performance.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Budget
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Budget</DialogTitle>
                            <DialogDescription>Define a new budget period.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Budget Name</Label>
                                <Input id="name" placeholder="e.g. FY 2024" {...form.register('name')} />
                                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input id="startDate" type="date" {...form.register('startDate')} />
                                    {form.formState.errors.startDate && <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input id="endDate" type="date" {...form.register('endDate')} />
                                    {form.formState.errors.endDate && <p className="text-sm text-red-500">{form.formState.errors.endDate.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" placeholder="Optional description" {...form.register('description')} />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Budget</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : budgets.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <DollarSign className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No budgets found</h3>
                        <p className="text-muted-foreground mb-4">Start by creating a new budget period.</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create Budget</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.map((budget) => (
                        <Card key={budget.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/finance/budgeting/${budget.id}`)}>
                            <CardHeader>
                                <CardTitle>{budget.name}</CardTitle>
                                <CardDescription>{budget.description || 'No description'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                                </div>
                                <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-primary">
                                    View Details <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
