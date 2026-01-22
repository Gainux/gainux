import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    PlayCircle,
    FileText,
    CheckCircle2,
    Clock,
    ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { trainingService } from "../../services/trainingService";
import { employeeService } from "../../services/employeeService";
import type { Training, TrainingProgress, Employee } from "../../types";

export default function MyLearning() {
    const { user, profile } = useAuth();
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, TrainingProgress>>({});
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user?.id, profile?.org_id]);

    const loadData = async () => {
        if (!user?.id || !profile?.org_id) return;
        try {
            // 1. Get Employee Profile
            const emp = await employeeService.getEmployeeByUserId(user.id);
            if (!emp) {
                setLoading(false);
                return;
            }
            setEmployee(emp);

            // 2. Get Trainings targeted to them
            const trainingData = await trainingService.getTrainings(
                profile.org_id,
                emp.departmentId,
                emp.designationId
            );
            setTrainings(trainingData);

            // 3. Get Progress for these trainings
            // Optimally we'd do a bulk fetch, but for now we'll just fetch one by one or assume we need a new service method
            // Actually, for V1 let's just fetch progress when rendering or lazy load. 
            // Better: Let's fetch progress for all trainings in parallel for a smooth UI.
            const pMap: Record<string, TrainingProgress> = {};
            await Promise.all(trainingData.map(async (t) => {
                const prog = await trainingService.getProgress(t.id, emp.id);
                if (prog) pMap[t.id] = prog;
            }));
            setProgressMap(pMap);

        } catch (error) {
            console.error("Failed to load my learning", error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (trainingId: string) => {
        if (!employee) return;
        try {
            await trainingService.updateProgress(trainingId, employee.id, 'completed');
            // Optimistic update
            const newProg: TrainingProgress = {
                id: 'temp',
                trainingId,
                employeeId: employee.id,
                status: 'completed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setProgressMap(prev => ({ ...prev, [trainingId]: newProg }));
        } catch (error) {
            console.error("Failed to update progress", error);
        }
    };

    if (loading) return <div>Loading courses...</div>;

    if (!employee) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                Employee profile not found. Please contact HR.
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trainings.map(training => {
                const progress = progressMap[training.id];
                const isCompleted = progress?.status === 'completed';

                return (
                    <Card key={training.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant={isCompleted ? "default" : "secondary"} className="mb-2">
                                    {isCompleted ? "Completed" : "Not Started"}
                                </Badge>
                                {training.contentType === 'video' ? <PlayCircle className="h-5 w-5 text-muted-foreground" /> : <FileText className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <CardTitle className="line-clamp-1">{training.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{training.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-4 w-4" />
                                <span>Self-paced</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2">
                            {training.contentUrl && (
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <a href={training.contentUrl} target="_blank" rel="noopener noreferrer">
                                        Open <ExternalLink className="ml-2 h-3 w-3" />
                                    </a>
                                </Button>
                            )}
                            {!isCompleted && (
                                <Button size="sm" className="w-full" onClick={() => handleComplete(training.id)}>
                                    Mark Complete
                                </Button>
                            )}
                            {isCompleted && (
                                <Button size="sm" variant="ghost" className="w-full cursor-default text-green-600 hover:text-green-700 hover:bg-green-50">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Done
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                );
            })}

            {trainings.length === 0 && (
                <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No Training Assigned</h3>
                    <p className="text-muted-foreground">You're all caught up! Check back later for new courses.</p>
                </div>
            )}
        </div>
    );
}
