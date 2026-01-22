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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, GripVertical } from "lucide-react";

import type { Deal } from "@/modules/crm/types";

type ColumnType = {
    id: string;
    title: string;
};

const COLUMNS: ColumnType[] = [
    { id: "new", title: "New Lead" },
    { id: "proposal", title: "Proposal Sent" },
    { id: "negotiation", title: "Negotiation" },
    { id: "won", title: "Closed Won" },
];

function SortableDealCard({ deal, onEdit, onClick }: { deal: Deal; onEdit: (deal: Deal) => void; onClick: (dealId: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: deal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onClick(deal.id)}>
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                            <div
                                className="cursor-grab active:cursor-grabbing mt-0.5"
                                {...attributes}
                                {...listeners}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-sm font-medium flex-1">
                                {deal.title}
                            </CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mt-1 -mr-1 flex-shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(deal);
                            }}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 pl-10">
                    <p className="text-xs text-muted-foreground">{deal.company?.name}</p>
                    <Badge variant="outline" className="mt-2">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: deal.currency || 'INR' }).format(deal.value || 0)}
                    </Badge>
                </CardContent>
            </Card>
        </div>
    );
}


function KanbanColumn({ column, deals, onEdit, onClick }: { column: ColumnType; deals: Deal[]; onEdit: (deal: Deal) => void; onClick: (dealId: string) => void }) {
    const { setNodeRef } = useSortable({ id: column.id });

    return (
        <div ref={setNodeRef} className="flex flex-col w-80 bg-muted/50 p-4 rounded-lg mr-4 min-h-[500px]">
            <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">
                {column.title} ({deals.length})
            </h3>
            <SortableContext
                items={deals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
            >
                {deals.map((deal) => (
                    <SortableDealCard key={deal.id} deal={deal} onEdit={onEdit} onClick={onClick} />
                ))}
            </SortableContext>
        </div>
    );
}

interface KanbanBoardProps {
    deals: Deal[];
    onDealMove: (dealId: string, newStage: string) => void;
    onDealEdit?: (deal: Deal) => void;
    onDealClick?: (dealId: string) => void;
}

export default function KanbanBoard({ deals: initialDeals, onDealMove, onDealEdit, onDealClick }: KanbanBoardProps) {
    // Transform flat array to columns map
    const [dealsMap, setDealsMap] = useState<Record<string, Deal[]>>({});
    const [activeId, setActiveId] = useState<string | null>(null);

    // Sync props to state (grouping)
    useEffect(() => {
        const newMap: Record<string, Deal[]> = {
            new: [],
            proposal: [],
            negotiation: [],
            won: [],
        };
        initialDeals.forEach(deal => {
            if (newMap[deal.stage]) {
                newMap[deal.stage].push(deal);
            } else {
                // Fallback for unknown stages
                if (!newMap['new']) newMap['new'] = [];
                newMap['new'].push(deal);
            }
        });
        setDealsMap(newMap);
    }, [initialDeals]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id: string) => {
        if (id in dealsMap) return id;
        return Object.keys(dealsMap).find((key) =>
            dealsMap[key].find((d) => d.id === id)
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId as string);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setDealsMap((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex((i) => i.id === active.id);
            const overIndex = overItems.findIndex((i) => i.id === overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, overItems.length),
                ],
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over?.id as string);

        if (
            activeContainer &&
            overContainer &&
            activeContainer === overContainer
        ) {
            const activeIndex = dealsMap[activeContainer].findIndex(
                (i) => i.id === active.id
            );
            const overIndex = dealsMap[overContainer].findIndex((i) => i.id === over!.id);

            if (activeIndex !== overIndex) {
                setDealsMap((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(
                        prev[activeContainer],
                        activeIndex,
                        overIndex
                    ),
                }));
            }
        }

        // Notify parent about move if changed container
        if (activeContainer && overContainer && activeContainer !== overContainer) {
            onDealMove(active.id as string, overContainer);
        }

        setActiveId(null);
    };

    const activeDeal = activeId
        ? Object.values(dealsMap)
            .flat()
            .find((d) => d.id === activeId)
        : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        deals={dealsMap[col.id] || []}
                        onEdit={onDealEdit || (() => { })}
                        onClick={onDealClick || (() => { })}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeDeal ? (
                    <Card className="cursor-grabbing shadow-lg rotate-2 w-[300px]">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium">{activeDeal.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-xs text-muted-foreground">{activeDeal.company?.name}</p>
                            <Badge variant="outline" className="mt-2">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: activeDeal.currency || 'INR' }).format(activeDeal.value || 0)}
                            </Badge>
                        </CardContent>
                    </Card>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
