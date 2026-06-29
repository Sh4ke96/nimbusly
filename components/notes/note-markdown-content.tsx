"use client";

import ReactMarkdown from "react-markdown";
import { NOTE_CONTENT_FORMAT } from "@/lib/constants/notes";
import type { NoteContentFormat } from "@/lib/constants/notes";
import { cn } from "@/lib/utils";

interface NoteMarkdownContentProps {
  content: string;
  contentFormat: NoteContentFormat;
  className?: string;
}

export function NoteMarkdownContent({
  content,
  contentFormat,
  className,
}: NoteMarkdownContentProps) {
  if (!content.trim()) return null;

  if (contentFormat !== NOTE_CONTENT_FORMAT.MARKDOWN) {
    return (
      <p className={cn("text-sm leading-relaxed text-foreground whitespace-pre-wrap", className)}>
        {content}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-foreground",
        "prose-headings:font-heading prose-headings:font-semibold",
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
