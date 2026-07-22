"use client";

import * as React from "react";

import { Bold, Italic, Link, List, ListOrdered, Quote, Strikethrough, Underline } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

interface ToolbarButton {
  icon: React.ComponentType<{ className?: string }>;
  command: string;
  arg?: string;
  title: string;
  queryCommand?: string; // document.queryCommandState key
}

const TOOLBAR: ToolbarButton[] = [
  { icon: Bold, command: "bold", title: "Bold", queryCommand: "bold" },
  { icon: Italic, command: "italic", title: "Italic", queryCommand: "italic" },
  { icon: Underline, command: "underline", title: "Underline", queryCommand: "underline" },
  { icon: Strikethrough, command: "strikeThrough", title: "Strikethrough", queryCommand: "strikeThrough" },
  { icon: List, command: "insertUnorderedList", title: "Bullet list", queryCommand: "insertUnorderedList" },
  { icon: ListOrdered, command: "insertOrderedList", title: "Numbered list", queryCommand: "insertOrderedList" },
  { icon: Quote, command: "formatBlock", arg: "blockquote", title: "Blockquote" },
  { icon: Link, command: "createLink", title: "Link" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
  minHeight = "120px",
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isInternalUpdate = React.useRef(false);
  const [activeCommands, setActiveCommands] = React.useState<Set<string>>(new Set());

  // Sync external value → DOM (only when value changes externally)
  React.useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalUpdate.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  function updateActiveStates() {
    const active = new Set<string>();
    for (const btn of TOOLBAR) {
      if (btn.queryCommand) {
        try {
          if (document.queryCommandState(btn.queryCommand)) {
            active.add(btn.command);
          }
        } catch {
          // ignore unsupported commands
        }
      }
    }
    setActiveCommands(active);
  }

  function exec(command: string, arg?: string) {
    if (command === "createLink") {
      const url = prompt("Enter URL:", "https://");
      if (!url) return;
      document.execCommand("createLink", false, url);
    } else {
      document.execCommand(command, false, arg);
    }
    editorRef.current?.focus();
    handleInput();
    updateActiveStates();
  }

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    isInternalUpdate.current = true;
    onChange(el.innerHTML === "<br>" ? "" : el.innerHTML);
    requestAnimationFrame(() => {
      isInternalUpdate.current = false;
    });
  }

  const isEmpty = !value || value === "<br>" || value === "";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b bg-muted/40 px-2 py-1.5">
        {TOOLBAR.map(({ icon: Icon, command, arg, title }) => {
          const isActive = activeCommands.has(command);
          return (
            <Button
              key={title}
              type="button"
              size="icon-sm"
              variant="ghost"
              title={title}
              aria-label={title}
              aria-pressed={isActive}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(command, arg);
              }}
              className={cn(
                "size-7 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/80"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
            </Button>
          );
        })}
      </div>

      {/* Editable area */}
      <div className="relative">
        {isEmpty && (
          <p className="pointer-events-none absolute top-2.5 left-3 select-none text-muted-foreground text-sm">
            {placeholder}
          </p>
        )}
        {/* biome-ignore lint/a11y/useSemanticElements: contentEditable div is correct for rich text editors */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          tabIndex={0}
          onInput={handleInput}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          onSelect={updateActiveStates}
          className="prose prose-sm dark:prose-invert max-w-none px-3 py-2.5 text-sm outline-none [&_blockquote]:border-muted-foreground/40 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:pl-4"
          style={{ minHeight }}
          aria-label="Product description"
          aria-multiline="true"
          role="textbox"
        />
      </div>
    </div>
  );
}
