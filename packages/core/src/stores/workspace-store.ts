"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Workspace {
  createdAt: number;
  id: string;
  name: string;
}

interface WorkspaceState {
  activeWorkspaceId: string | null;
  createWorkspace: (name: string) => Workspace;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  setActiveWorkspace: (id: string) => void;
  workspaces: Workspace[];
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, _get) => ({
      activeWorkspaceId: null,
      createWorkspace: (name: string) => {
        const workspace: Workspace = {
          createdAt: Date.now(),
          id: generateId(),
          name,
        };
        set((state) => ({
          activeWorkspaceId: workspace.id,
          workspaces: [...state.workspaces, workspace],
        }));
        return workspace;
      },
      deleteWorkspace: (id: string) => {
        set((state) => {
          const remaining = state.workspaces.filter((w) => w.id !== id);
          return {
            activeWorkspaceId:
              state.activeWorkspaceId === id
                ? (remaining[0]?.id ?? null)
                : state.activeWorkspaceId,
            workspaces: remaining,
          };
        });
      },
      renameWorkspace: (id: string, name: string) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, name } : w
          ),
        }));
      },
      setActiveWorkspace: (id: string) => {
        set({ activeWorkspaceId: id });
      },
      workspaces: [],
    }),
    {
      name: "hyperion-workspaces",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
