"use client";

import { safeUUID } from "@workspace/core/lib/uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AgentMessage {
  content: string;
  id: string;
  role: "user" | "agent" | "system";
  timestamp: number;
}

interface AgentState {
  addMessage: (workspaceId: string, message: AgentMessage) => void;
  apiKey: string;
  availableModels: string[];
  baseUrl: string;
  clearMessages: (workspaceId: string) => void;
  isOpen: boolean;
  messages: Record<string, AgentMessage[]>; // Mapped by workspace ID
  provider: string;
  selectedModel: string;
  setApiKey: (key: string) => void;
  setAvailableModels: (models: string[]) => void;
  setBaseUrl: (url: string) => void;
  setOpen: (isOpen: boolean) => void;
  setProvider: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  toggleOpen: () => void;
}

function generateId(): string {
  return safeUUID();
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      apiKey: "",
      availableModels: [],
      baseUrl: "https://opencode.ai/zen/v1",
      provider: "opencode",
      selectedModel: "",
      setApiKey: (key) => set({ apiKey: key }),
      setAvailableModels: (models) => set({ availableModels: models }),
      setBaseUrl: (url) => set({ baseUrl: url }),
      setProvider: (provider) => set({ provider }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      isOpen: false,
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (isOpen: boolean) => set({ isOpen }),
      messages: {},
      addMessage: (workspaceId: string, message: AgentMessage) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [workspaceId]: [...(state.messages[workspaceId] || []), message],
          },
        })),
      clearMessages: (workspaceId: string) =>
        set((state) => {
          const newMessages = { ...state.messages };
          delete newMessages[workspaceId];
          return { messages: newMessages };
        }),
    }),
    {
      name: "hyperion-agent-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages,
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        provider: state.provider,
        selectedModel: state.selectedModel,
        availableModels: state.availableModels,
      }),
    }
  )
);
