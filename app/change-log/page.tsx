import type { Metadata } from "next";
import { ChangeLogView } from "@/components/changelog/change-log-view";
import { cookies } from "next/headers";
import { LANG, LANG_COOKIE, type Lang } from "@/lib/constants/lang";
import { dict } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANG_COOKIE)?.value;
  const lang: Lang = value === LANG.EN ? LANG.EN : LANG.PL;

  return {
    title: dict[lang].changeLog.metaTitle,
    description: dict[lang].changeLog.metaDescription,
  };
}

export default function ChangeLogPage() {
  return <ChangeLogView />;
}
