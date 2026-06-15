"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemberAvatar } from "@/components/member-avatar";
import { LogoutConfirmDialog } from "@/components/account/logout-confirm-dialog";
import { AppModuleNav } from "@/components/app/app-module-nav";
import { getDisplayName } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { HEADER_CONTROL_HEIGHT } from "@/lib/ui/header-controls";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { navigateSettingsTab, settingsTabHref, SETTINGS_TAB } from "@/lib/profile/settings-tabs";
import { isFamilyFounder } from "@/lib/profile/family-roles";
import { useProfileStore } from "@/lib/stores/profile-store";
import {
  Bell,
  ChevronDown,
  ListChecks,
  KeyRound,
  LogOut,
  Palette,
  Ticket,
  User,
  Users,
} from "lucide-react";

export function AccountMenu() {
  const t = useT();
  const pathname = usePathname();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const family = useProfileStore((s) => s.family);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const displayName = profile
    ? getDisplayName(profile)
    : user?.email?.split("@")[0] ?? "…";

  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY;
  const modeLabel = isFamily ? t.account.modeFamily : t.account.modeSolo;

  return (
    <div className="flex items-center gap-2">
      {profile && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                HEADER_CONTROL_HEIGHT,
                "inline-flex w-8 shrink-0 cursor-pointer items-center justify-center rounded-none border transition-colors",
                isFamily
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground"
              )}
            >
              {isFamily ? <Users className="size-3.5" /> : <User className="size-3.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{modeLabel}</TooltipContent>
        </Tooltip>
      )}

      <AppModuleNav />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              HEADER_CONTROL_HEIGHT,
              "rounded-none py-0 pl-1 pr-2 gap-1.5 hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <MemberAvatar name={displayName} color={profile?.avatar_color} size="xs" />
            <span className="hidden sm:block text-xs font-medium max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 rounded-none p-2">
          <DropdownMenuLabel className="font-heading font-semibold text-sm truncate">
            {displayName}
          </DropdownMenuLabel>
          <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate -mt-1">
            {user?.email}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/notifications" className="flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              {t.notifications.menu}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={settingsTabHref(SETTINGS_TAB.PROFILE)}
              onClick={(e) => navigateSettingsTab(SETTINGS_TAB.PROFILE, pathname) && e.preventDefault()}
              className="flex items-center gap-2"
            >
              <Palette className="size-4 text-primary" />
              {t.account.menuProfile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={settingsTabHref(SETTINGS_TAB.ACCOUNT)}
              onClick={(e) => navigateSettingsTab(SETTINGS_TAB.ACCOUNT, pathname) && e.preventDefault()}
              className="flex items-center gap-2"
            >
              <User className="size-4 text-primary" />
              {t.account.menuAccountType}
            </Link>
          </DropdownMenuItem>
          {profile?.account_mode === ACCOUNT_MODE.SOLO && !profile.family_id && (
            <DropdownMenuItem asChild>
              <Link
                href={`${settingsTabHref(SETTINGS_TAB.ACCOUNT)}#join-family`}
                onClick={(e) =>
                  navigateSettingsTab(SETTINGS_TAB.ACCOUNT, pathname, "#join-family") &&
                  e.preventDefault()
                }
                className="flex items-center gap-2"
              >
                <Ticket className="size-4 text-primary" />
                {t.account.joinFamilyTitle}
              </Link>
            </DropdownMenuItem>
          )}
          {profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href={settingsTabHref(SETTINGS_TAB.FAMILY)}
                  onClick={(e) =>
                    navigateSettingsTab(SETTINGS_TAB.FAMILY, pathname) && e.preventDefault()
                  }
                  className="flex items-center gap-2"
                >
                  <Users className="size-4 text-primary" />
                  {t.account.menuFamily}
                </Link>
              </DropdownMenuItem>
              {isFamilyFounder(family, user?.id) ? (
                <DropdownMenuItem asChild>
                  <Link
                    href={settingsTabHref(SETTINGS_TAB.SHOPPING_CATEGORIES)}
                    onClick={(e) =>
                      navigateSettingsTab(SETTINGS_TAB.SHOPPING_CATEGORIES, pathname) &&
                      e.preventDefault()
                    }
                    className="flex items-center gap-2"
                  >
                    <ListChecks className="size-4 text-primary" />
                    {t.account.menuShoppingCategories}
                  </Link>
                </DropdownMenuItem>
              ) : null}
            </>
          )}
          <DropdownMenuItem asChild>
            <Link
              href={settingsTabHref(SETTINGS_TAB.PASSWORD)}
              onClick={(e) =>
                navigateSettingsTab(SETTINGS_TAB.PASSWORD, pathname) && e.preventDefault()
              }
              className="flex items-center gap-2"
            >
              <KeyRound className="size-4 text-primary" />
              {t.account.menuPassword}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              setLogoutOpen(true);
            }}
          >
            <LogOut className="size-4" />
            {t.dashboard.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
}
