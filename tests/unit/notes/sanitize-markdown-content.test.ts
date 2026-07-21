import assert from "node:assert/strict";
import test from "node:test";
import { NOTE_CONTENT_FORMAT } from "@/lib/constants/notes";
import { sanitizeNoteMarkdownContent } from "@/lib/notes/sanitize-markdown-content";

test("sanitizeNoteMarkdownContent passes plain text unchanged", () => {
  assert.equal(
    sanitizeNoteMarkdownContent("hello world", NOTE_CONTENT_FORMAT.PLAIN),
    "hello world"
  );
});

test("sanitizeNoteMarkdownContent strips unsafe markdown links", () => {
  assert.equal(
    sanitizeNoteMarkdownContent(
      "click [x](javascript:alert(1))",
      NOTE_CONTENT_FORMAT.MARKDOWN
    ),
    "click x)"
  );
});

test("sanitizeNoteMarkdownContent keeps safe https links", () => {
  const result = sanitizeNoteMarkdownContent(
    "see [site](https://example.com)",
    NOTE_CONTENT_FORMAT.MARKDOWN
  );
  assert.ok(result.includes("https://example.com"));
  assert.ok(result.includes("[site]"));
});
