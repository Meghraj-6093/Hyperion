"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SplitDirection = "horizontal" | "vertical";

export interface TerminalPane {
  id: string;
  title: string;
}

interface TerminalState {
  activePaneId: string | null;
  createPane: () => TerminalPane;
  deletePane: (id: string) => void;
  panes: TerminalPane[];
  renamePane: (id: string, title: string) => void;
  setActivePane: (id: string) => void;
}

function generatePaneId(): string {
  return `term-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      activePaneId: null,
      createPane: () => {
        const pane: TerminalPane = {
          id: generatePaneId(),
          title: `Terminal ${get().panes.length + 1}`,
        };
        set((state) => ({
          activePaneId: pane.id,
          panes: [...state.panes, pane],
        }));
        return pane;
      },
      deletePane: (id: string) => {
        set((state) => {
          const remaining = state.panes.filter((p) => p.id !== id);
          return {
            activePaneId:
              state.activePaneId === id
                ? (remaining[0]?.id ?? null)
                : state.activePaneId,
            panes: remaining,
          };
        });
      },
      panes: [],
      renamePane: (id: string, title: string) => {
        set((state) => ({
          panes: state.panes.map((p) => (p.id === id ? { ...p, title } : p)),
        }));
      },
      setActivePane: (id: string) => {
        set({ activePaneId: id });
      },
    }),
    {
      name: "hyperion-terminals",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
