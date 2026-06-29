import type { Metadata } from "next";
import { LANG } from "@/lib/constants/lang";
import { dict } from "@/lib/i18n";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: dict[LANG.PL].meta.title,
  description: dict[LANG.PL].meta.description,
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
