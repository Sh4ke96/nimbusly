"use client";

import Link from "next/link";
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
import { getDisplayName } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/stores/profile-store";
import { logout } from "@/app/(app)/actions";
import {
  ChevronDown,
  KeyRound,
  LogOut,
  Palette,
  User,
  Users,
} from "lucide-react";

export function AccountMenu() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  const displayName = profile
    ? getDisplayName(profile)
    : user?.email?.split("@")[0] ?? "…";

  const isFamily = profile?.account_mode === "family";
  const modeLabel = isFamily ? t.account.modeFamily : t.account.modeSolo;

  return (
    <div className="flex items-center gap-2">
      {profile && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-none border transition-colors",
                isFamily
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground"
              )}
            >
              {isFamily ? <Users className="size-4" /> : <User className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{modeLabel}</TooltipContent>
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-auto rounded-none py-1 pl-1 pr-3 gap-2 hover:border-primary/40 hover:bg-primary/5"
          >
            <MemberAvatar name={displayName} color={profile?.avatar_color} size="sm" />
            <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
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
            <Link href="/profile/settings?tab=profile" className="flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              {t.account.menuProfile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/settings?tab=account" className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              {t.account.menuAccountType}
            </Link>
          </DropdownMenuItem>
          {profile?.account_mode === "family" && profile.family_id && (
            <DropdownMenuItem asChild>
              <Link href="/profile/settings?tab=family" className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                {t.account.menuFamily}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/change-password" className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              {t.account.menuPassword}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive" asChild>
            <form action={logout} className="w-full">
              <button type="submit" className="flex w-full items-center gap-2">
                <LogOut className="size-4" />
                {t.dashboard.logout}
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
