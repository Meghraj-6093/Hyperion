"use client";

import type { KanbanCard as KanbanCardType } from "@workspace/core/stores/kanban-store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

interface KanbanCardProps {
  card: KanbanCardType;
  onDelete: (id: string) => void;
}

export function KanbanCard({ card, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { type: "card", card } });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="bg-background flex items-start gap-2 rounded-md border p-2 shadow-sm"
      ref={setNodeRef}
      style={style}
    >
      <button className="mt-0.5 cursor-grab touch-none" {...attributes} {...listeners}>
        <GripVertical className="text-muted-foreground size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{card.title}</p>
        {card.description && (
          <p className="text-muted-foreground mt-0.5 truncate text-xs">{card.description}</p>
        )}
      </div>
      <button
        className="mt-0.5 cursor-pointer"
        onClick={() => onDelete(card.id)}
      >
        <Trash2 className="text-muted-foreground size-3 hover:text-destructive" />
      </button>
    </div>
  );
}
