import { useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/context/AuthContext";
import { recruitmentService } from "../services/recruitmentService";
import type { RecruitApplication } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CandidateDetailsDialog from "../components/CandidateDetailsDialog";
import { toast } from "sonner";

const COLUMNS = [
    { id: "applied", title: "Applied", color: "bg-blue-100 text-blue-800" },
    { id: "screening", title: "Screening", color: "bg-purple-100 text-purple-800" },
    { id: "interview", title: "Interview", color: "bg-yellow-100 text-yellow-800" },
    { id: "offered", title: "Offered", color: "bg-green-100 text-green-800" },
    { id: "hired", title: "Hired", color: "bg-emerald-100 text-emerald-800" },
    { id: "rejected", title: "Rejected", color: "bg-red-100 text-red-800" },
] as const;

type ColumnId = typeof COLUMNS[number]['id'];

interface SortableItemProps {
    application: RecruitApplication;
    onClick: (app: RecruitApplication) => void;
}

function SortableItem({ application, onClick }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: application.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
            <Card
                className="cursor-pointer hover:shadow-md transition-all border-none shadow-sm"
                onClick={() => onClick(application)}
            >
                <CardContent className="p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{application.candidate?.firstName?.[0]}{application.candidate?.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold leading-none">
                                {application.candidate?.firstName} {application.candidate?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-[140px] truncate">
                                {application.job?.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function DroppableColumn({ id, title, color, applications, onClickApp }: { id: string, title: string, color: string, applications: RecruitApplication[], onClickApp: (app: RecruitApplication) => void }) {
    const { setNodeRef } = useSortable({ id });

    return (
        <div ref={setNodeRef} className="flex-shrink-0 w-80 bg-muted/30 rounded-lg flex flex-col h-full max-h-[calc(100vh-220px)]">
            <div className={`p-3 font-semibold text-sm flex items-center justify-between sticky top-0 bg-muted/30 backdrop-blur-sm rounded-t-lg z-10`}>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{title}</span>
                <Badge variant="secondary" className="text-xs">{applications.length}</Badge>
            </div>
            <div className="flex-1 p-2 overflow-y-auto">
                <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    {applications.map((app) => (
                        <SortableItem key={app.id} application={app} onClick={onClickApp} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}

export default function PipelineBoard() {
    const { profile } = useAuth();
    const [applications, setApplications] = useState<RecruitApplication[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<RecruitApplication | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        loadApplications();
    }, [profile?.org_id]);

    const loadApplications = async () => {
        if (!profile?.org_id) return;
        try {
            const data = await recruitmentService.getApplications(profile.org_id);
            setApplications(data);
        } catch (error) {
            console.error("Failed to load applications", error);
            toast.error("Failed to load applications");
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeApplication = applications.find(app => app.id === active.id);
        if (!activeApplication) return;

        // If dropped over a column container (which is mapped to status ID)
        let newStatus = over.id as ColumnId;

        // If dropped over another item, find that item's status
        // Check if over.id is NOT a column ID (meaning it's an item ID)
        if (!COLUMNS.some(col => col.id === over.id)) {
            const overApp = applications.find(app => app.id === over.id);
            if (overApp) {
                newStatus = overApp.status as ColumnId;
            } else {
                return; // Can't determine status
            }
        }

        if (activeApplication.status === newStatus) return;

        // Optimistic UI Update
        const oldStatus = activeApplication.status;
        setApplications(apps => apps.map(app =>
            app.id === activeApplication.id ? { ...app, status: newStatus } : app
        ));

        try {
            await recruitmentService.updateApplicationStatus(activeApplication.id, newStatus);
            toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
            // Revert on error
            setApplications(apps => apps.map(app =>
                app.id === activeApplication.id ? { ...app, status: oldStatus } : app
            ));
        }
    };

    const handleAppClick = (app: RecruitApplication) => {
        // Construct a candidate object with resumeUrl from the application's nested candidate object
        // The type mismatch (nested candidate vs flat candidate) needs handling if CandidateDetailsDialog expects a flat object
        // Based on service getApplications map:
        /*
            candidate: {
                ...row.candidate, // spread raw
                firstName: ...,
                resumeUrl: ... 
            }
        */
        // The `RecruitApplication` type likely has `candidate: RecruitCandidate` (ref-like) or similar structure.
        // Let's pass the candidate object directly if it matches.

        // Actually, CandidateDetailsDialog expects RecruitCandidate type. 
        // Let's verify if `app.candidate` matches `RecruitCandidate`.
        // Assuming it does based on recruitmentService mapping.
        setSelectedApplication(app);
        setIsDetailsOpen(true);
    };

    const activeApplication = activeId ? applications.find(app => app.id === activeId) : null;

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex-1 overflow-x-auto">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex space-x-4 h-full min-w-max pb-4">
                        {COLUMNS.map((col) => (
                            <DroppableColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                color={col.color}
                                applications={applications.filter(app => app.status === col.id)}
                                onClickApp={handleAppClick}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeApplication ? (
                            <Card className="w-72 shadow-xl rotate-2 cursor-grabbing border-primary/20">
                                <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{activeApplication.candidate?.firstName?.[0]}{activeApplication.candidate?.lastName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold leading-none">
                                                {activeApplication.candidate?.firstName} {activeApplication.candidate?.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 max-w-[140px] truncate">
                                                {activeApplication.job?.title}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{new Date(activeApplication.appliedAt).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <CandidateDetailsDialog
                candidate={selectedApplication?.candidate || null}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
        </div>
    );
}
