"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BellOff,
  ChevronLeft,
  Compass,
  HelpCircle,
  Map,
  Search,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NimbusCharacter } from "@/components/nimbus/nimbus-character";
import { NIMBUS_TOUR_ID } from "@/lib/constants/nimbus-tour";
import { getModuleTourIdForPath } from "@/lib/constants/nimbus-tour";
import {
  NIMBUS_FAQ_HREF,
  NIMBUS_FAQ_IDS,
  NIMBUS_FAQ_MODULE_LABEL_KEY,
  type NimbusFaqId,
} from "@/lib/nimbus/faq";
import { sortFaqIdsForPath } from "@/lib/nimbus/faq-sort";
import {
  NIMBUS_SNOOZE_24H_MS,
  NIMBUS_SNOOZE_WEEK_MS,
  snoozeNimbusHints,
} from "@/lib/nimbus/snooze";
import { loadTourResume } from "@/lib/nimbus/tour-resume";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MENU_PANEL_CLASS = "flex w-full flex-col rounded-none md:w-80";
const MENU_ICON_BOX_CLASS =
  "flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/10";
const MENU_ICON_CLASS = "size-4 text-primary";

interface NimbusCompanionMenuProps {
  onClose: () => void;
}

export function NimbusCompanionMenu({ onClose }: NimbusCompanionMenuProps) {
  const t = useT();
  const pathname = usePathname();
  const profile = useProfileStore((s) => s.profile);
  const menuView = useNimbusStore((s) => s.menuView);
  const menuOpen = useNimbusStore((s) => s.menuOpen);
  const setMenuView = useNimbusStore((s) => s.setMenuView);
  const startTour = useNimbusStore((s) => s.startTour);
  const dismissHint = useNimbusStore((s) => s.dismissHint);
  const [faqQuery, setFaqQuery] = useState<string>("");
  const [openFaqId, setOpenFaqId] = useState<NimbusFaqId | null>(NIMBUS_FAQ_IDS[0]);

  const moduleTourId = getModuleTourIdForPath(pathname);
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const isSolo = profile?.account_mode === ACCOUNT_MODE.SOLO && !profile.family_id;
  const resumeTour = useMemo(
    () => (menuOpen && menuView === "main" ? loadTourResume() : null),
    [menuOpen, menuView]
  );

  const filteredFaqIds = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    const base = !q
      ? NIMBUS_FAQ_IDS
      : NIMBUS_FAQ_IDS.filter((id) => {
          const item = t.companion.faq[id];
          return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
        });
    return sortFaqIdsForPath(base, pathname);
  }, [faqQuery, pathname, t]);

  function handleSnooze(durationMs: number) {
    snoozeNimbusHints(durationMs);
    dismissHint();
    onClose();
    toast.message(t.companion.snoozeDone);
  }

  if (menuView === "snooze") {
    return (
      <MenuPanel>
        <MenuSubheader
          title={t.companion.snoozeTitle}
          subtitle={t.companion.snoozeActionDesc}
          onBack={() => setMenuView("main")}
        />
        <div className="space-y-1 p-2">
          <MenuAction
            icon={BellOff}
            title={t.companion.snooze24h}
            desc={t.companion.snooze24hDesc}
            onClick={() => handleSnooze(NIMBUS_SNOOZE_24H_MS)}
          />
          <MenuAction
            icon={BellOff}
            title={t.companion.snoozeWeek}
            desc={t.companion.snoozeWeekDesc}
            onClick={() => handleSnooze(NIMBUS_SNOOZE_WEEK_MS)}
          />
        </div>
      </MenuPanel>
    );
  }

  if (menuView === "faq") {
    return (
      <MenuPanel>
        <MenuSubheader
          title={t.companion.askNimbus}
          subtitle={t.companion.askNimbusDesc}
          onBack={() => {
            setFaqQuery("");
            setMenuView("main");
          }}
        />

        <div className="border-b border-border px-3 py-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder={t.companion.faqSearchPlaceholder}
              className="h-9 rounded-none border-border bg-card pl-9 text-sm"
            />
          </div>
        </div>

        <ul className="max-h-[min(22rem,50dvh)] space-y-2 overflow-y-auto p-2 md:max-h-[min(22rem,50vh)]">
          {filteredFaqIds.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              {t.companion.faqEmpty}
            </li>
          ) : (
            filteredFaqIds.map((id) => {
              const item = t.companion.faq[id];
              const open = openFaqId === id;
              const moduleLabel = t.companion.faqModules[NIMBUS_FAQ_MODULE_LABEL_KEY[id]];

              return (
                <li key={id}>
                  <div
                    className={cn(
                      "border border-border bg-card shadow-sm transition-colors",
                      open && "border-primary/40 ring-1 ring-primary/15"
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left"
                      onClick={() => setOpenFaqId(open ? null : id)}
                      aria-expanded={open}
                    >
                      <span className={cn(MENU_ICON_BOX_CLASS, "mt-0.5")}>
                        <HelpCircle className={MENU_ICON_CLASS} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-snug text-foreground">
                          {item.q}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {moduleLabel}
                        </span>
                      </span>
                    </button>

                    {open && (
                      <div className="border-t border-border/70 bg-muted/15 px-3 pb-3 pt-2">
                        <p className="text-xs leading-relaxed text-muted-foreground">{item.a}</p>
                        <Link
                          href={NIMBUS_FAQ_HREF[id]}
                          className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          onClick={onClose}
                        >
                          {t.companion.faqGoTo}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </MenuPanel>
    );
  }

  return (
    <MenuPanel>
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <NimbusCharacter mood="hover" size={40} />
            <div className="min-w-0">
              <p className="font-heading font-semibold text-foreground">{t.companion.name}</p>
              <p className="text-xs text-muted-foreground">{t.companion.menuSubtitle}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-none"
            onClick={onClose}
            aria-label={t.companion.closeMenuAria}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 p-2">
        {resumeTour && (
          <MenuAction
            icon={Map}
            title={t.companion.resumeTourAction}
            desc={t.companion.resumeTourActionDesc}
            onClick={() => {
              startTour(resumeTour.tourId, { stepIndex: resumeTour.stepIndex });
              onClose();
            }}
          />
        )}

        {moduleTourId && (
          <MenuAction
            icon={Map}
            title={t.companion.moduleTourAction}
            desc={t.companion.moduleTourActionDesc}
            onClick={() => {
              startTour(moduleTourId);
              onClose();
            }}
          />
        )}

        {isFamily && (
          <MenuAction
            icon={Users}
            title={t.companion.familyTourAction}
            desc={t.companion.familyTourActionDesc}
            onClick={() => {
              startTour(NIMBUS_TOUR_ID.FAMILY);
              onClose();
            }}
          />
        )}

        {isSolo && (
          <MenuAction
            icon={Users}
            title={t.companion.settingsSoloTourAction}
            desc={t.companion.settingsSoloTourActionDesc}
            onClick={() => {
              startTour(NIMBUS_TOUR_ID.SETTINGS_SOLO);
              onClose();
            }}
          />
        )}

        <MenuAction
          icon={Compass}
          title={t.companion.tourAction}
          desc={t.companion.tourActionDesc}
          onClick={() => {
            startTour(NIMBUS_TOUR_ID.INTRO);
            onClose();
          }}
        />

        <MenuAction
          icon={HelpCircle}
          title={t.companion.askNimbus}
          desc={t.companion.askNimbusDesc}
          onClick={() => setMenuView("faq")}
        />

        <MenuAction
          icon={BellOff}
          title={t.companion.snoozeTitle}
          desc={t.companion.snoozeActionDesc}
          onClick={() => setMenuView("snooze")}
        />
      </div>
    </MenuPanel>
  );
}

function MenuPanel({ children }: { children: React.ReactNode }) {
  return <div className={MENU_PANEL_CLASS}>{children}</div>;
}

function MenuSubheader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  const t = useT();

  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-3 py-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-none"
        onClick={onBack}
        aria-label={t.companion.backToMenu}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold leading-tight">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function MenuAction({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-left text-sm",
        "cursor-pointer transition-colors hover:bg-muted/60"
      )}
      onClick={onClick}
    >
      <span className={MENU_ICON_BOX_CLASS}>
        <Icon className={MENU_ICON_CLASS} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-snug text-foreground line-clamp-1">
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground line-clamp-1">
          {desc}
        </span>
      </span>
    </button>
  );
}
