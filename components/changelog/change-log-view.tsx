"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/navbar";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { CHANGELOG_ENTRY_TYPE } from "@/lib/constants/changelog";
import { getChangelogEntries } from "@/lib/changelog/entries";
import type { ChangelogEntry, ChangelogEntryType } from "@/lib/constants/changelog";
import { useLang, useT } from "@/lib/lang-context";
import { LANG } from "@/lib/constants/lang";
import { cn } from "@/lib/utils";

function formatReleaseDate(date: string, lang: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(lang === LANG.EN ? "en-GB" : "pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function typeLabel(
  type: ChangelogEntryType,
  labels: {
    typeMajor: string;
    typeMinor: string;
    typeFix: string;
  }
): string {
  switch (type) {
    case CHANGELOG_ENTRY_TYPE.MAJOR:
      return labels.typeMajor;
    case CHANGELOG_ENTRY_TYPE.MINOR:
      return labels.typeMinor;
    case CHANGELOG_ENTRY_TYPE.FIX:
      return labels.typeFix;
  }
}

function typeBadgeClass(type: ChangelogEntryType): string {
  switch (type) {
    case CHANGELOG_ENTRY_TYPE.MAJOR:
      return "border-primary/30 bg-primary/10 text-primary";
    case CHANGELOG_ENTRY_TYPE.MINOR:
      return "border-attention/30 bg-attention/10 text-attention";
    case CHANGELOG_ENTRY_TYPE.FIX:
      return "border-border bg-muted text-muted-foreground";
  }
}

function ChangelogEntryCard({
  entry,
  lang,
}: {
  entry: ChangelogEntry;
  lang: string;
}) {
  const t = useT();
  const copy = lang === LANG.EN ? entry.title.en : entry.title.pl;
  const changes = lang === LANG.EN ? entry.changes.en : entry.changes.pl;

  return (
    <article className="border border-border bg-card/90 p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          v{entry.version}
        </h2>
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider font-medium border px-2 py-0.5",
            typeBadgeClass(entry.type)
          )}
        >
          {typeLabel(entry.type, t.changeLog)}
        </span>
        <time
          dateTime={entry.date}
          className="text-xs text-muted-foreground ml-auto"
        >
          {formatReleaseDate(entry.date, lang)}
        </time>
      </div>
      <p className="text-sm font-medium text-foreground">{copy}</p>
      <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
        {changes.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
  );
}

export function ChangeLogView() {
  const t = useT();
  const { lang } = useLang();
  const entries = getChangelogEntries();

  return (
    <div className="relative min-h-screen flex flex-col text-foreground">
      <AmbientBackground variant="landing" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNavbar />

        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 space-y-8">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              {t.changeLog.backHome}
            </Link>
            <h1 className="font-heading font-bold text-3xl tracking-tight">
              {t.changeLog.title}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {t.changeLog.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {entries.map((entry) => (
              <ChangelogEntryCard key={entry.version} entry={entry} lang={lang} />
            ))}
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
