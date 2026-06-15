import type { Dict } from "@/lib/i18n/types";

export type TourStepCopy = { title: string; body: string };

export type TourSummaryCopy = TourStepCopy & {
  learned: string[];
  next: string[];
};

export function resolveNimbusTourStepCopy(
  t: Dict,
  copyKey: string
): TourStepCopy | null {
  const parts = copyKey.split(".");
  if (parts[0] === "intro") {
    const step = parts.slice(1).join(".");
    const intro = t.nimbusTour.intro as Record<string, TourStepCopy>;
    return intro[step] ?? null;
  }

  if (parts[0] === "family") {
    const step = parts.slice(1).join(".");
    const family = t.nimbusTour.family as Record<string, TourStepCopy | TourSummaryCopy>;
    const entry = family[step];
    if (!entry) return null;
    return { title: entry.title, body: entry.body };
  }

  const [moduleId, stepId] = parts;
  if (!moduleId || !stepId) return null;
  const modules = t.nimbusTour.modules as Record<string, Record<string, TourStepCopy | TourSummaryCopy>>;
  const entry = modules[moduleId]?.[stepId];
  if (!entry) return null;
  return { title: entry.title, body: entry.body };
}

export function resolveNimbusTourSummaryCopy(
  t: Dict,
  copyKey: string
): TourSummaryCopy | null {
  const parts = copyKey.split(".");
  const bucket =
    parts[0] === "family"
      ? (t.nimbusTour.family as Record<string, TourSummaryCopy>)
      : (t.nimbusTour.modules[parts[0]] as Record<string, TourSummaryCopy> | undefined);

  const stepId = parts[0] === "family" ? parts.slice(1).join(".") : parts[1];
  const entry = bucket?.[stepId];
  if (!entry || !("learned" in entry)) return null;
  return entry;
}
