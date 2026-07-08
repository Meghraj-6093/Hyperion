"use client";

import { useMounted } from "@workspace/core/hooks/use-mounted";
import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Plus, Trash2, Zap } from "lucide-react";
import { useState } from "react";

export function WorkspacePage() {
  const mounted = useMounted();
  const {
    createWorkspace,
    deleteWorkspace,
    setActiveWorkspace,
    workspaces,
    activeWorkspaceId,
  } = useWorkspaceStore();
  const [newName, setNewName] = useState("");

  if (!mounted) {
    return null;
  }

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    createWorkspace(name);
    setNewName("");
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground text-sm">
            Manage your isolated work environments
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreate();
              }
            }}
            placeholder="New workspace name..."
            value={newName}
          />
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-1 size-4" />
            Create
          </Button>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <Zap className="size-12 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">No workspaces yet</p>
                <p className="text-muted-foreground text-sm">
                  Create your first workspace to get started
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Card
              className={`cursor-pointer transition-colors hover:bg-accent ${
                activeWorkspaceId === ws.id ? "ring-2 ring-primary" : ""
              }`}
              key={ws.id}
              onClick={() => setActiveWorkspace(ws.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">{ws.name}</CardTitle>
                <Button
                  className="size-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWorkspace(ws.id);
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  Created {new Date(ws.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
