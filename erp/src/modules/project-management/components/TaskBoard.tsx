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
    type DragOverEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, GripVertical, Calendar, User } from "lucide-react";
import type { Task, TaskStatus } from "../types";

// Types
export type ColumnType = {
    id: TaskStatus;
    title: string;
};

const COLUMNS: ColumnType[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
];

// Sortable Task Card
function SortableTaskCard({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task.id, data: { ...task } }); // store data for drag overlay

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'urgent': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'secondary'; // yellow-ish ideally, default usually grey/primary
            case 'low': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="mb-3 cursor-default hover:border-primary/50 transition-colors"
        >
            <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
                <Badge variant={getPriorityColor(task.priority) as any} className="text-xs px-1.5 py-0">
                    {task.priority}
                </Badge>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-grab active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </CardHeader>
            <CardContent className="p-3 pt-2">
                <div className="font-medium text-sm mb-1 line-clamp-2">{task.title}</div>
                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    {task.assignee && (
                        <div className="flex items-center" title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
                            <User className="mr-1 h-3 w-3" />
                            {task.assignee.firstName}
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {task.dueDate}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-2 pt-0 flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => onEdit(task)}
                >
                    <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
            </CardFooter>
        </Card>
    );
}

// Column Component
function KanbanColumn({ column, tasks, onEdit }: { column: ColumnType; tasks: Task[]; onEdit: (task: Task) => void }) {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        }
    });

    return (
        <div className="flex-1 min-w-[280px] flex flex-col h-full bg-muted/40 rounded-lg p-2">
            <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="rounded-full px-2">
                    {tasks.length}
                </Badge>
            </div>

            <div ref={setNodeRef} className="flex-1 overflow-y-auto px-1 min-h-[100px]">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            onEdit={onEdit}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}

// Main Board Component
interface TaskBoardProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
    onTaskEdit: (task: Task) => void;
}

export default function TaskBoard({ tasks: initialTasks, onTaskMove, onTaskEdit }: TaskBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [startStatus, setStartStatus] = useState<string | null>(null);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function findContainer(id: string) {
        if (COLUMNS.find(c => c.id === id)) {
            return id;
        }
        return tasks.find((t) => t.id === id)?.status;
    }

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        setActiveId(active.id as string);
        const container = findContainer(active.id as string);
        setStartStatus(container as string);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId as string);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        // Optimistic UI update during drag
        setTasks((prev) => {
            return prev.map(t => {
                if (t.id === active.id) {
                    return { ...t, status: overContainer as TaskStatus };
                }
                return t;
            });
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        // activeContainer here will be the NEW container because of optimistic update in DragOver
        // So we must use startStatus to check if it actually changed
        const overContainer = over ? findContainer(over.id as string) : null;

        if (
            startStatus &&
            overContainer &&
            (startStatus !== overContainer)
        ) {
            // Moved to different column
            onTaskMove(active.id as string, overContainer as TaskStatus);
            // State is already updated optimistically in DragOver, but we confirm here
            setTasks((prev) => {
                return prev.map(t => t.id === active.id ? { ...t, status: overContainer as TaskStatus } : t);
            });
        }

        setActiveId(null);
        setStartStatus(null);
    }

    // Get tasks for each column
    const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        tasks={getTasksByStatus(col.id)}
                        onEdit={onTaskEdit}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <SortableTaskCard task={activeTask} onEdit={() => { }} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
