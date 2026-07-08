"use client";

import { useMounted } from "@workspace/core/hooks/use-mounted";
import { useEffect, useRef } from "react";

interface TerminalPaneProps {
  id: string;
  isActive: boolean;
  onFocus: () => void;
}

// biome-ignore lint: xterm types are complex, dynamic import
type TerminalInstance = any;
// biome-ignore lint: xterm addon types are complex, dynamic import
type FitAddonInstance = any;

export function TerminalPane({ id, isActive, onFocus }: TerminalPaneProps) {
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<TerminalInstance>(null);
  const fitAddonRef = useRef<FitAddonInstance>(null);

  // biome-ignore lint: dynamic import, only re-init on id change
  useEffect(() => {
    if (!(mounted && containerRef.current)) {
      return;
    }

    let disposed = false;
    let observer: ResizeObserver | undefined;

    async function init() {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");

      if (disposed || !containerRef.current) {
        return;
      }

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
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

      observer = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          fitAddonRef.current?.fit();
        });
      });

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
    }

    init();

    return () => {
      disposed = true;
      observer?.disconnect();
      termRef.current?.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [id, mounted]);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 text-zinc-500">
        Loading terminal...
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: xterm.js requires a div container
    <div
      aria-label="Terminal pane"
      className={`flex flex-1 overflow-hidden ${
        isActive ? "ring-1 ring-primary" : ""
      }`}
      onClick={onFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onFocus();
        }
      }}
      ref={containerRef}
      role="button"
      style={{ minHeight: 0 }}
      tabIndex={0}
    />
  );
}
