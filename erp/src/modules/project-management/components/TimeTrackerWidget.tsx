import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Play, Square, Loader2 } from "lucide-react";
import { projectService } from "../services/projectService";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function TimeTrackerWidget() {
    const { user, profile } = useAuth();
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [activeTimer, setActiveTimer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState("00:00:00");

    // Form
    const [description, setDescription] = useState("");
    const [projectId, setProjectId] = useState("");
    const [projects, setProjects] = useState<any[]>([]);

    // Init
    useEffect(() => {
        const init = async () => {
            if (!user) return;
            try {
                // Get employee ID
                let empId = "";
                if (profile?.role === 'employee') {
                    const { data } = await supabase.from('employees').select('id').eq('user_id', user.id).single();
                    if (data) empId = data.id;
                } else {
                    // If admin, maybe fetch as well or use different logic? 
                    // Let's assume admins also have employee records or we use user.id mapping if implemented
                    // For now, try fetching employee record linked to user
                    const { data } = await supabase.from('employees').select('id').eq('user_id', user.id).maybeSingle();
                    if (data) empId = data.id;
                }

                setEmployeeId(empId);

                if (empId) {
                    const [timer, projs] = await Promise.all([
                        projectService.getActiveTimer(empId),
                        projectService.getProjects(empId)
                    ]);
                    setActiveTimer(timer);
                    setProjects(projs || []);

                    if (timer) {
                        setDescription(timer.description || "");
                        setProjectId(timer.projectId);
                    }
                }
            } catch (error) {
                console.error("Failed to init timer", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) init();
    }, [user, profile]);

    // Timer Tick
    useEffect(() => {
        if (!activeTimer?.startTime) return;

        const interval = setInterval(() => {
            const start = new Date(activeTimer.startTime).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsedTime(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTimer]);

    const handleStart = async () => {
        if (!employeeId) return toast.error("Employee profile not found");
        if (!projectId) return toast.error("Please select a project");
        if (!description) return toast.error("Please enter a description");

        try {
            setLoading(true);
            const newTimer = await projectService.startTimer({
                employeeId,
                projectId,
                description,
                taskId: null // Basic timer for now
            });
            setActiveTimer(newTimer);
            toast.success("Timer started");
        } catch (error) {
            console.error(error);
            toast.error("Failed to start timer");
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        if (!activeTimer) return;
        try {
            setLoading(true);
            await projectService.stopTimer(activeTimer.id);
            setActiveTimer(null);
            setDescription("");
            setProjectId("");
            setElapsedTime("00:00:00");
            toast.success("Timer stopped");
        } catch (error) {
            console.error(error);
            toast.error("Failed to stop timer");
        } finally {
            setLoading(false);
        }
    };

    if (!employeeId) return null; // Don't show if not an employee

    if (activeTimer) {
        return (
            <div className="flex items-center gap-4 bg-muted/50 rounded-full px-4 py-1.5 border">
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground">Running</span>
                    <span className="text-sm font-bold font-mono">{elapsedTime}</span>
                </div>
                <div className="hidden md:block max-w-[150px] truncate text-sm" title={activeTimer.description}>
                    {activeTimer.description}
                </div>
                <Badge variant="outline" className="hidden lg:inline-flex">{activeTimer.projectName}</Badge>
                <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full"
                    onClick={handleStop}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-3 w-3 fill-current" />}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="hidden md:block w-[180px]">
                <Input
                    placeholder="What are you working on?"
                    className="h-8 text-sm"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>
            <div className="hidden lg:block w-[140px]">
                <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleStart}
                disabled={loading}
                title="Start Timer"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
            </Button>
        </div>
    );
}
