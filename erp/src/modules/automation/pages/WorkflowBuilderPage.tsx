import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { workflowService } from "../services/workflowService";
import type { TriggerType, ActionType, WorkflowCondition, WorkflowAction } from "../types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
    { value: 'lead_created', label: 'Lead Created' },
    { value: 'deal_created', label: 'Deal Created' },
    { value: 'deal_won', label: 'Deal Won' },
    { value: 'task_assigned', label: 'Task Assigned' },
    { value: 'invoice_overdue', label: 'Invoice Overdue' },
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'create_task', label: 'Create Task' },
    { value: 'slack_notification', label: 'Slack Notification' },
    { value: 'update_field', label: 'Update Record Field' },
];

export default function WorkflowBuilderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = id && id !== 'new';
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [trigger, setTrigger] = useState<TriggerType>('lead_created');
    const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
    const [actions, setActions] = useState<WorkflowAction[]>([]);

    useEffect(() => {
        if (isEditing) {
            loadWorkflow();
        }
    }, [id]);

    const loadWorkflow = async () => {
        if (!id) return;
        try {
            const data = await workflowService.getWorkflowById(id);
            if (data) {
                setName(data.name);
                setDescription(data.description || "");
                setTrigger(data.trigger);
                setConditions(data.conditions);
                setActions(data.actions);
            } else {
                toast.error("Workflow not found");
                navigate("/automation/workflows");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return toast.error("Please enter a workflow name");
        if (actions.length === 0) return toast.error("Please add at least one action");

        setSaving(true);
        try {
            const workflowData = {
                name,
                description,
                isActive: true,
                trigger,
                conditions,
                actions
            };

            if (isEditing && id) {
                await workflowService.updateWorkflow(id, workflowData);
                toast.success("Workflow updated");
            } else {
                await workflowService.createWorkflow(workflowData);
                toast.success("Workflow created");
            }
            navigate("/automation/workflows");
        } catch (error) {
            toast.error("Failed to save workflow");
        } finally {
            setSaving(false);
        }
    };

    const addCondition = () => {
        setConditions([...conditions, { field: '', operator: 'equals', value: '' }]);
    };

    const removeCondition = (index: number) => {
        const newConditions = [...conditions];
        newConditions.splice(index, 1);
        setConditions(newConditions);
    };

    const updateCondition = (index: number, field: keyof WorkflowCondition, value: any) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setConditions(newConditions);
    };

    const addAction = () => {
        setActions([...actions, { id: crypto.randomUUID(), type: 'send_email', config: {} }]);
    };

    const removeAction = (index: number) => {
        const newActions = [...actions];
        newActions.splice(index, 1);
        setActions(newActions);
    };

    const updateAction = (index: number, field: keyof WorkflowAction, value: any) => {
        const newActions = [...actions];
        // @ts-ignore
        newActions[index][field] = value;
        setActions(newActions);
    };

    const updateActionConfig = (index: number, key: string, value: any) => {
        const newActions = [...actions];
        newActions[index].config = { ...newActions[index].config, [key]: value };
        setActions(newActions);
    };


    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/automation/workflows")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold tracking-tight">{isEditing ? "Edit Workflow" : "New Workflow"}</h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate("/automation/workflows")}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" /> Save Workflow
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 max-w-4xl mx-auto">
                {/* 1. Basics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Workflow Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New Lead Welcome Email" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this automation does..." />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Trigger */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Zap className="h-4 w-4" /></div>
                            Trigger
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label>When this happens...</Label>
                            <Select value={trigger} onValueChange={(v: TriggerType) => setTrigger(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRIGGER_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Conditions */}
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Conditions (Optional)</span>
                            <Button variant="ghost" size="sm" onClick={addCondition}><Plus className="h-4 w-4 mr-2" /> Add Condition</Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {conditions.length === 0 && <p className="text-sm text-muted-foreground italic">No conditions. Workflow will run every time.</p>}
                        {conditions.map((cond, idx) => (
                            <div key={idx} className="flex gap-2 items-end p-4 border rounded-md bg-muted/20">
                                <div className="space-y-2 flex-1">
                                    <Label>Field</Label>
                                    <Input value={cond.field} onChange={e => updateCondition(idx, 'field', e.target.value)} placeholder="e.g. status, value" />
                                </div>
                                <div className="space-y-2 w-[150px]">
                                    <Label>Operator</Label>
                                    <Select value={cond.operator} onValueChange={v => updateCondition(idx, 'operator', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="equals">Equals</SelectItem>
                                            <SelectItem value="contains">Contains</SelectItem>
                                            <SelectItem value="greater_than">Greater Than</SelectItem>
                                            <SelectItem value="less_than">Less Than</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>Value</Label>
                                    <Input value={String(cond.value)} onChange={e => updateCondition(idx, 'value', e.target.value)} />
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeCondition(idx)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 4. Actions */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Actions</span>
                            <Button variant="ghost" size="sm" onClick={addAction}><Plus className="h-4 w-4 mr-2" /> Add Action</Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {actions.length === 0 && <p className="text-sm text-red-500 italic">At least one action is required.</p>}
                        {actions.map((action, idx) => (
                            <div key={action.id} className="space-y-4 p-4 border rounded-md bg-muted/20">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0">{idx + 1}</Badge>
                                        <Label className="font-semibold">Action Type</Label>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeAction(idx)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Select value={action.type} onValueChange={v => updateAction(idx, 'type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ACTION_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Separator />

                                {/* Dynamic Config Form based on Type */}
                                <div className="space-y-3">
                                    {action.type === 'send_email' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>To (Email or Variable)</Label>
                                                <Input value={action.config.to || ''} onChange={e => updateActionConfig(idx, 'to', e.target.value)} placeholder="{{lead.email}}" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Subject</Label>
                                                <Input value={action.config.subject || ''} onChange={e => updateActionConfig(idx, 'subject', e.target.value)} placeholder="Welcome!" />
                                            </div>
                                        </>
                                    )}
                                    {action.type === 'slack_notification' && (
                                        <div className="space-y-2">
                                            <Label>Message</Label>
                                            <Input value={action.config.message || ''} onChange={e => updateActionConfig(idx, 'message', e.target.value)} placeholder="New deal won!" />
                                        </div>
                                    )}
                                    {/* Add more config fields here for other actions */}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
