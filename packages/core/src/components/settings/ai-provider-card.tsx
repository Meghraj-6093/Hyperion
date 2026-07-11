"use client";

import { useAgentStore } from "@workspace/core/stores/agent-store";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Globe, KeyRound, RefreshCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AiProviderCard() {
  const {
    apiKey,
    setApiKey,
    baseUrl,
    setBaseUrl,
    provider,
    setProvider,
    selectedModel,
    setSelectedModel,
    availableModels,
    setAvailableModels,
  } = useAgentStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleFetchModels = async () => {
    if (!apiKey) {
      toast.error("Please enter an API Key first.");
      return;
    }

    setIsLoading(true);
    try {
      const isTauri =
        typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
      let response;
      let data;

      if (isTauri) {
        const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
        response = await tauriFetch(`${baseUrl}/models`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        data = await response.json();
      } else {
        // Use proxy for web app to bypass CORS
        response = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `${baseUrl}/models`,
            method: "GET",
            headers: { Authorization: `Bearer ${apiKey}` },
          }),
        });
        if (!response.ok) {
          throw new Error(`Proxy HTTP error! status: ${response.status}`);
        }
        data = await response.json();
      }

      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => m.id);
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(selectedModel)) {
          setSelectedModel(models[0]);
        }
        toast.success(`Fetched ${models.length} models successfully!`);
      } else {
        toast.error("Invalid response format from provider.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch models. Check your Base URL and API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl">
      <CardHeader className="border-border/40 border-b bg-muted/20 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">
              Main Agent AI Provider (BYOK)
            </CardTitle>
            <CardDescription>
              Configure your preferred LLM provider for the Main Agent.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label>Provider type</Label>
          <Select
            onValueChange={(val) => {
              setProvider(val);
              if (val === "opencode") {
                setBaseUrl("https://opencode.ai/zen/v1");
              } else if (val === "openai") {
                setBaseUrl("https://api.openai.com/v1");
              }
            }}
            value={provider}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opencode">
                OpenCode Zen (Recommended)
              </SelectItem>
              <SelectItem value="openai">
                OpenAI Compatible (OpenRouter, LMStudio, etc)
              </SelectItem>
              <SelectItem value="anthropic">Anthropic (Direct)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Globe className="size-3.5" /> Base URL
          </Label>
          <Input
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://opencode.ai/zen/v1"
            value={baseUrl}
          />
          <p className="text-[11px] text-muted-foreground">
            E.g. https://opencode.ai/zen/v1 or https://openrouter.ai/api/v1
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <KeyRound className="size-3.5" /> API Key
          </Label>
          <Input
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            type="password"
            value={apiKey}
          />
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label>Selected Model</Label>
            <Button
              className="h-7 text-xs"
              disabled={isLoading}
              onClick={handleFetchModels}
              size="sm"
              variant="secondary"
            >
              <RefreshCcw
                className={cn("mr-1.5 size-3", isLoading && "animate-spin")}
              />
              Fetch Models
            </Button>
          </div>
          <Select onValueChange={setSelectedModel} value={selectedModel}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  availableModels.length === 0
                    ? "Fetch models first..."
                    : "Select a model..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
              {availableModels.length === 0 && (
                <SelectItem disabled value="none">
                  No models fetched
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

// Needed to make cn work if you didn't import it at the top
import { cn } from "@workspace/ui/lib/utils";
