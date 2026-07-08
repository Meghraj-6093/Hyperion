"use client";

import { useKanbanStore } from "@workspace/core/stores/kanban-store";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "@workspace/core/components/kanban/kanban-card";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { KanbanColumn as KanbanColumnType } from "@workspace/core/stores/kanban-store";

interface KanbanColumnProps {
  column: KanbanColumnType;
  onDeleteColumn: (id: string) => void;
}

export function KanbanColumn({ column, onDeleteColumn }: KanbanColumnProps) {
  const { addCard, cards, deleteCard } = useKanbanStore();
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const columnCards = cards.filter((c) => c.columnId === column.id);
  const cardIds = columnCards.map((c) => c.id);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const handleAddCard = () => {
    const title = newCardTitle.trim();
    if (!title) return;
    addCard(column.id, title);
    setNewCardTitle("");
    setIsAdding(false);
  };

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30 ${
        isOver ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs">{columnCards.length}</span>
          <button
            className="cursor-pointer"
            onClick={() => onDeleteColumn(column.id)}
          >
            <Trash2 className="text-muted-foreground size-3 hover:text-destructive" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2" ref={setNodeRef}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {columnCards.map((card) => (
            <KanbanCard card={card} key={card.id} onDelete={deleteCard} />
          ))}
        </SortableContext>

        {isAdding ? (
          <div className="flex flex-col gap-1">
            <input
              autoFocus
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-8 rounded-md border px-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCard();
                if (e.key === "Escape") setIsAdding(false);
              }}
              placeholder="Card title..."
              value={newCardTitle}
            />
            <div className="flex gap-1">
              <button
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-2 py-0.5 text-xs"
                onClick={handleAddCard}
              >
                Add
              </button>
              <button
                className="text-muted-foreground hover:text-foreground rounded px-2 py-0.5 text-xs"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-3" />
            Add card
          </button>
        )}
      </div>
    </div>
  );
}
