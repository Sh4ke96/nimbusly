import { Suspense } from "react";
import { NotesView } from "@/components/notes/notes-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function NotesPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <NotesView />
    </Suspense>
  );
}
