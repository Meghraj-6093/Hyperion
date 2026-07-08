"use client";

import { useMounted } from "@workspace/core/hooks/use-mounted";
import { useEffect, useRef } from "react";

interface TerminalPaneProps {
  id: string;
  isActive: boolean;
  onFocus: () => void;
}

export function TerminalPane({ id, isActive, onFocus }: TerminalPaneProps) {
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    let disposed = false;

    async function init() {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");

      if (disposed || !containerRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        theme: {
          background: "#0a0a0a",
          cursor: "#a1a1aa",
          foreground: "#d4d4d8",
        },
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      term.open(containerRef.current);

      requestAnimationFrame(() => {
        if (!disposed) {
          fitAddon.fit();
        }
      });

      term.writeln("Welcome to Hyperion Terminal");
      term.writeln("");

      termRef.current = term;
      fitAddonRef.current = fitAddon;
    }

    init();

    return () => {
      disposed = true;
      termRef.current?.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [id, mounted]);

  useEffect(() => {
    if (!fitAddonRef.current) return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitAddonRef.current?.fit();
      });
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 text-zinc-500">
        Loading terminal...
      </div>
    );
  }

  return (
    <div
      className={`flex flex-1 overflow-hidden ${
        isActive ? "ring-1 ring-primary" : ""
      }`}
      onClick={onFocus}
      ref={containerRef}
      style={{ minHeight: 0 }}
    />
  );
}
