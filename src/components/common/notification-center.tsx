"use client";

import { AlertTriangle, Bell, CheckCircle2, Info, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/avatar";
import { Button } from "@/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { ScrollArea } from "@/components/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { useTranslations } from "@/i18n";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";

/** The production gateway / website backend URL */
const GATEWAY_URL = "https://marshell.bond";

interface ServerMessage {
  body: string;
  created_at: string;
  id: string;
  level: "info" | "warning" | "success" | "error";
  title: string;
}

function levelIcon(level: ServerMessage["level"]) {
  switch (level) {
    case "warning":
      return AlertTriangle;
    case "success":
      return CheckCircle2;
    case "error":
      return AlertTriangle;
    default:
      return Info;
  }
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationCenter() {
  const t = useTranslations("NotificationCenter");
  const { isOpen, setOpen } = useNotificationStore();
  const session = useAuthStore((s) => s.session);

  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!session?.session_id) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${session.session_id}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } catch {
      // silently fail — network may be unavailable
    } finally {
      setLoading(false);
    }
  }, [session?.session_id]);

  // Fetch when popover opens (or when session changes while open)
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, fetchMessages]);

  const markRead = useCallback(
    async (id: string) => {
      if (!session?.session_id) {
        return;
      }
      // Optimistically remove from UI
      setMessages((prev) => prev.filter((m) => m.id !== id));
      try {
        await fetch(`${GATEWAY_URL}/api/notifications/${id}/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.session_id}` },
        });
      } catch {
        // ignore — message already removed from UI
      }
    },
    [session?.session_id]
  );

  const markAllRead = useCallback(async () => {
    const ids = messages.map((m) => m.id);
    setMessages([]);
    for (const id of ids) {
      try {
        await fetch(`${GATEWAY_URL}/api/notifications/${id}/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.session_id}` },
        });
      } catch {
        // ignore
      }
    }
  }, [messages, session?.session_id]);

  const hasUnread = messages.length > 0;

  return (
    <Popover onOpenChange={setOpen} open={isOpen}>
      <PopoverTrigger asChild={true}>
        <Button
          aria-label="Notifications"
          className="relative"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Bell className="size-4" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="hidden w-96 gap-0 p-0 md:flex">
        <div className="flex items-center justify-between border-b p-4">
          <span className="font-semibold text-sm">{t("title")}</span>
          <Button
            className="h-auto p-0 text-xs"
            disabled={!hasUnread}
            onClick={markAllRead}
            variant="link"
          >
            {t("markAllRead")}
          </Button>
        </div>

        <Tabs className="gap-0" defaultValue="all">
          <div className="p-3">
            <TabsList className="w-full">
              <TabsTrigger value="all">{t("all")}</TabsTrigger>
              <TabsTrigger value="unread">{t("unread")}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <ScrollArea className="h-80 p-3 pt-0">
              {loading ? (
                <div className="flex h-20 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <NotificationList items={messages} onRead={markRead} />
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread">
            <ScrollArea className="h-80 p-3 pt-0">
              {loading ? (
                <div className="flex h-20 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <NotificationList items={messages} onRead={markRead} />
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="border-t px-3 py-2">
          <Button
            className="w-full justify-center text-xs"
            onClick={fetchMessages}
            size="sm"
            variant="ghost"
          >
            {loading ? (
              <Loader2 className="mr-1.5 size-3 animate-spin" />
            ) : null}
            {t("seeAll")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationList({
  items,
  onRead,
}: {
  items: ServerMessage[];
  onRead: (id: string) => void;
}) {
  const t = useTranslations("NotificationCenter");

  if (!items.length) {
    return (
      <Empty className="rounded-md border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bell />
          </EmptyMedia>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = levelIcon(item.level);
        return (
          <button
            className="flex w-full items-start gap-2 rounded-md border p-2 text-left transition-colors hover:bg-muted/50"
            key={item.id}
            onClick={() => onRead(item.id)}
            title="Click to dismiss"
            type="button"
          >
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="bg-transparent">
                <Icon className="size-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-medium text-sm text-foreground">
                {item.title}
              </span>
              <p className="line-clamp-2 text-muted-foreground text-xs leading-snug">
                {item.body}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-3">
              <span className="text-muted-foreground text-xs">
                {formatRelativeTime(item.created_at)}
              </span>
              {/* unread dot */}
              <span className="size-2 rounded-full bg-primary" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
