"use client";

import { useTerminalStore } from "@workspace/core/stores/terminal-store";
import { Button } from "@workspace/ui/components/button";
import { Plus, SquareX } from "lucide-react";

export function TerminalToolbar() {
  const { activePaneId, createPane, deletePane, panes, setActivePane } =
    useTerminalStore();

  return (
    <div className="flex items-center gap-1 border-b px-2 py-1">
      <div className="flex gap-1 overflow-x-auto">
        {panes.map((pane) => (
          <button
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-accent ${
              activePaneId === pane.id
                ? "bg-accent text-foreground"
                : "text-muted-foreground"
            }`}
            key={pane.id}
            onClick={() => setActivePane(pane.id)}
            type="button"
          >
            {pane.title}
            <SquareX
              className="size-3 cursor-pointer hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deletePane(pane.id);
              }}
            />
          </button>
        ))}
      </div>
      <Button
        className="ml-auto size-7 p-0"
        onClick={createPane}
        size="icon"
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
