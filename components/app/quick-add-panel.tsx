"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { ListChecks, Plus, ShoppingCart, StickyNote } from "lucide-react";
import { createChoreTask } from "@/app/(app)/chores/actions";
import { createNote } from "@/app/(app)/notes/actions";
import { addShoppingListItem } from "@/app/(app)/shopping/actions";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { ChoreAssigneePicker } from "@/components/chores/chore-assignee-picker";
import { ChoreDatePicker } from "@/components/chores/chore-date-picker";
import { NoteCategoryPicker } from "@/components/notes/note-category-picker";
import {
  NoteVisibilityPicker,
  isValidNoteVisibilitySelection,
  type NoteVisibilitySelection,
} from "@/components/notes/note-visibility-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QUICK_ADD_ACTION, type QuickAddActionId } from "@/lib/constants/quick-add";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTE_CONTENT_FORMAT } from "@/lib/constants/notes";
import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { NOTE_FORM_FIELD } from "@/lib/notes/types";
import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import type { ShoppingList } from "@/lib/shopping-lists/types";
import { SHOPPING_LIST_ITEM_MAX_LENGTH } from "@/lib/constants/shopping-lists";
import { CHORE_RECURRENCE, CHORE_STATUS, CHORE_TITLE_MAX_LENGTH } from "@/lib/constants/chores";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickAddPanelProps {
  onSuccess?: () => void;
  className?: string;
  hideHeading?: boolean;
}

export function QuickAddPanel({ onSuccess, className, hideHeading = false }: QuickAddPanelProps) {
  const t = useT();
  const lists = useShoppingListsStore((s) => s.lists);
  const [active, setActive] = useState<QuickAddActionId | null>(null);
  const hasShoppingLists = lists.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {!hideHeading ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.search.quickAddHeading}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-2">
        <Button
          type="button"
          variant={active === QUICK_ADD_ACTION.CHORE ? "default" : "outline"}
          className="rounded-none justify-start gap-2 h-auto min-h-11 py-2.5 whitespace-normal text-left"
          onClick={() => setActive(QUICK_ADD_ACTION.CHORE)}
        >
          <ListChecks className="size-4" />
          {t.search.quickAddChore}
        </Button>
        <Button
          type="button"
          variant={active === QUICK_ADD_ACTION.NOTE ? "default" : "outline"}
          className="rounded-none justify-start gap-2 h-auto min-h-11 py-2.5 whitespace-normal text-left"
          onClick={() => setActive(QUICK_ADD_ACTION.NOTE)}
        >
          <StickyNote className="size-4" />
          {t.search.quickAddNote}
        </Button>
        <Button
          type="button"
          variant={active === QUICK_ADD_ACTION.SHOPPING_ITEM ? "default" : "outline"}
          className="rounded-none justify-start gap-2 h-auto min-h-11 py-2.5 whitespace-normal text-left"
          onClick={() => setActive(QUICK_ADD_ACTION.SHOPPING_ITEM)}
          disabled={!hasShoppingLists}
        >
          <ShoppingCart className="size-4" />
          {t.search.quickAddShopping}
        </Button>
      </div>

      {active === QUICK_ADD_ACTION.CHORE && <QuickAddChoreForm onSuccess={onSuccess} />}
      {active === QUICK_ADD_ACTION.NOTE && <QuickAddNoteForm onSuccess={onSuccess} />}
      {active === QUICK_ADD_ACTION.SHOPPING_ITEM && hasShoppingLists && (
        <QuickAddShoppingForm lists={lists} onSuccess={onSuccess} />
      )}
    </div>
  );
}

function QuickAddChoreForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [title, setTitle] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(() => new Date());
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [state, action, pending] = useActionState(createChoreTask, null);
  useActionFeedback(state, onSuccess);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!title.trim()) {
      e.preventDefault();
      toast.error(t.chores.errorTitleRequired);
    }
  }

  return (
    <form action={action} className="space-y-3 border border-border p-3" onSubmit={onSubmit}>
      <input type="hidden" name={CHORE_FORM_FIELD.STATUS} value={CHORE_STATUS.PENDING} />
      <input type="hidden" name={CHORE_FORM_FIELD.RECURRENCE} value={CHORE_RECURRENCE.NONE} />

      <div className="space-y-1.5">
        <Label htmlFor="quick-add-chore-title">{t.chores.titleLabel}</Label>
        <Input
          id="quick-add-chore-title"
          name={CHORE_FORM_FIELD.TITLE}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={CHORE_TITLE_MAX_LENGTH}
          className="rounded-none"
          placeholder={t.chores.titlePlaceholder}
          disabled={pending}
        />
      </div>

      <ChoreDatePicker
        date={dueDate}
        onDateChange={setDueDate}
        recurrence={CHORE_RECURRENCE.NONE}
      />

      <ChoreAssigneePicker
        profile={profile}
        members={members}
        assignedTo={assignedTo}
        onAssigneeChange={setAssignedTo}
      />

      <Button type="submit" size="sm" className="rounded-none w-full" disabled={pending}>
        <Plus className="size-4" />
        {pending ? t.chores.saving : t.search.quickAddSubmit}
      </Button>
    </form>
  );
}

function QuickAddNoteForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const categories = useNotesStore((s) => s.categories);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [visibility, setVisibility] = useState<NoteVisibilitySelection>({
    visibleToAll: true,
    memberIds: [],
  });
  const [state, action, pending] = useActionState(createNote, null);

  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  useActionFeedback(state, () => {
    setTitle("");
    setContent("");
    setCategoryId("");
    setVisibility({ visibleToAll: true, memberIds: [] });
    onSuccess?.();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!title.trim()) {
      e.preventDefault();
      toast.error(t.notes.errorTitleRequired);
      return;
    }
    if (isFamily && !isValidNoteVisibilitySelection(visibility)) {
      e.preventDefault();
      toast.error(t.notes.errorInvalidVisibility);
    }
  }

  return (
    <form action={action} className="space-y-3 border border-border p-3" onSubmit={onSubmit}>
      <input type="hidden" name={NOTE_FORM_FIELD.IS_PINNED} value="0" />
      <input type="hidden" name={NOTE_FORM_FIELD.CONTENT_FORMAT} value={NOTE_CONTENT_FORMAT.PLAIN} />

      <div className="space-y-1.5">
        <Label htmlFor="quick-add-note-title">{t.notes.titleLabel}</Label>
        <Input
          id="quick-add-note-title"
          name={NOTE_FORM_FIELD.TITLE}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="rounded-none"
          placeholder={t.notes.titlePlaceholder}
          disabled={pending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quick-add-note-content">{t.notes.contentLabel}</Label>
        <Textarea
          id="quick-add-note-content"
          name={NOTE_FORM_FIELD.CONTENT}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={5000}
          className="rounded-none min-h-24 resize-y"
          placeholder={t.notes.contentPlaceholder}
          disabled={pending}
        />
      </div>

      {categories.length > 0 ? (
        <NoteCategoryPicker
          value={categoryId}
          onChange={setCategoryId}
          categories={categories}
        />
      ) : null}

      {isFamily ? (
        <NoteVisibilityPicker
          members={members}
          value={visibility}
          onChange={setVisibility}
        />
      ) : null}

      <Button type="submit" size="sm" className="rounded-none w-full" disabled={pending}>
        <Plus className="size-4" />
        {pending ? t.notes.saving : t.search.quickAddSubmit}
      </Button>
    </form>
  );
}

function QuickAddShoppingForm({
  lists,
  onSuccess,
}: {
  lists: ShoppingList[];
  onSuccess?: () => void;
}) {
  const t = useT();
  const [listId, setListId] = useState<string>(lists[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState<string>("");
  const categories = useShoppingCategoriesStore((s) => s.categories);
  const fetchCategories = useShoppingCategoriesStore((s) => s.fetchCategories);

  const effectiveListId = useMemo(
    () => lists.find((list) => list.id === listId)?.id ?? lists[0]?.id ?? "",
    [lists, listId]
  );

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const submitItem = useCallback(
    (prev: AccountActionState, formData: FormData) => {
      formData.set(SHOPPING_FORM_FIELD.LIST_ID, effectiveListId);
      if (categoryId) {
        formData.set(SHOPPING_FORM_FIELD.CATEGORY_ID, categoryId);
      } else {
        formData.delete(SHOPPING_FORM_FIELD.CATEGORY_ID);
      }
      return addShoppingListItem(prev, formData);
    },
    [categoryId, effectiveListId]
  );

  const [state, action, pending] = useActionState(submitItem, null);
  useActionFeedback(state, () => {
    setCategoryId("");
    onSuccess?.();
  });

  return (
    <form action={action} className="space-y-3 border border-border p-3">
      <input type="hidden" name={SHOPPING_FORM_FIELD.QUANTITY} value="1" />

      <div className="space-y-1.5">
        <Label htmlFor="quick-add-shopping-list">{t.search.quickAddShoppingListLabel}</Label>
        <Select
          value={effectiveListId}
          onValueChange={(value) => {
            setListId(value);
            setCategoryId("");
          }}
          disabled={pending}
        >
          <SelectTrigger id="quick-add-shopping-list" className="rounded-none w-full">
            <SelectValue placeholder={t.search.quickAddShoppingListLabel} />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-2">
          <Label>{t.shoppingLists.categorySelectPlaceholder}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={categoryId === "" ? "default" : "outline"}
              className="h-auto min-h-10 cursor-pointer whitespace-normal rounded-none px-3 py-2 text-left text-sm"
              onClick={() => setCategoryId("")}
              disabled={pending}
            >
              {t.shoppingLists.uncategorizedLabel}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                variant={categoryId === category.id ? "default" : "outline"}
                className="h-auto min-h-10 cursor-pointer whitespace-normal rounded-none px-3 py-2 text-left text-sm"
                onClick={() => setCategoryId(category.id)}
                disabled={pending}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="quick-add-shopping-content">{t.shoppingLists.itemLabel}</Label>
        <Input
          id="quick-add-shopping-content"
          name={SHOPPING_FORM_FIELD.CONTENT}
          required
          maxLength={SHOPPING_LIST_ITEM_MAX_LENGTH}
          className="rounded-none"
          placeholder={t.shoppingLists.itemPlaceholder}
          disabled={pending}
        />
      </div>
      <Button type="submit" size="sm" className="rounded-none w-full" disabled={pending || !effectiveListId}>
        <Plus className="size-4" />
        {pending ? t.shoppingLists.saving : t.search.quickAddSubmit}
      </Button>
    </form>
  );
}
