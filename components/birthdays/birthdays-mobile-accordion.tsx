"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BirthdaysList } from "@/components/birthdays/birthdays-list";
import { CARD_TITLE_ROW_CLASSNAME } from "@/components/ui/card";
import { useT } from "@/lib/lang-context";
import type { BirthdayEntry } from "@/lib/birthdays/types";
import { cn } from "@/lib/utils";

type BirthdaysMobileAccordionProps = {
  entries: BirthdayEntry[];
  loading: boolean;
  loaded: boolean;
  focusedEntryId: string | null;
  userId: string | undefined;
  deleteAction: (formData: FormData) => void;
  deletePending: boolean;
  onFocus: (entry: BirthdayEntry) => void;
  onEdit: (entry: BirthdayEntry) => void;
  onAdd?: () => void;
  tourTarget?: string;
};

export function BirthdaysMobileAccordion({
  entries,
  loading,
  loaded,
  focusedEntryId,
  userId,
  deleteAction,
  deletePending,
  onFocus,
  onEdit,
  onAdd,
  tourTarget,
}: BirthdaysMobileAccordionProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      className="rounded-none border-2 border-border bg-card shadow-sm lg:hidden"
      data-nimbus-tour={tourTarget}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className={CARD_TITLE_ROW_CLASSNAME}>{t.birthdays.listTitle}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="border-t border-border">
          <BirthdaysList
            entries={entries}
            loading={loading}
            loaded={loaded}
            focusedEntryId={focusedEntryId}
            userId={userId}
            deleteAction={deleteAction}
            deletePending={deletePending}
            onFocus={onFocus}
            onEdit={onEdit}
            onAdd={onAdd}
          />
        </div>
      ) : null}
    </div>
  );
}
