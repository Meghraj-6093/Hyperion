"use client";

import { useMounted } from "@workspace/core/hooks/use-mounted";
import { useTerminalStore } from "@workspace/core/stores/terminal-store";
import { TerminalPane } from "@workspace/core/components/terminal/terminal-pane";
import { TerminalToolbar } from "@workspace/core/components/terminal/terminal-toolbar";
import { useEffect } from "react";

export function TerminalGrid() {
  const mounted = useMounted();
  const { activePaneId, createPane, panes, setActivePane } = useTerminalStore();

  useEffect(() => {
    if (mounted && panes.length === 0) {
      createPane();
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading terminals...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TerminalToolbar />
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden p-0.5">
        {panes.map((pane) => (
          <TerminalPane
            id={pane.id}
            isActive={activePaneId === pane.id}
            key={pane.id}
            onFocus={() => setActivePane(pane.id)}
          />
        ))}
      </div>
    </div>
  );
}
