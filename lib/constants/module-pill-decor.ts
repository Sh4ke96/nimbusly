import { APP_MODULE_HERO_IDS, getAppModuleIcon } from "@/lib/constants/app-modules";
import type { AppModuleId } from "@/lib/constants/app-modules";

export type ModuleLabelKey = AppModuleId;

export const MODULE_PILL_ITEMS = APP_MODULE_HERO_IDS.map((key) => ({
  key,
  icon: getAppModuleIcon(key),
}));

export const MODULE_PILL_POSITIONS = [
  { top: "5%", left: "3%", duration: "4.2s", delay: "0s" },
  { top: "7%", left: "55%", duration: "3.6s", delay: "0.5s" },
  { top: "20%", left: "74%", duration: "4.8s", delay: "1.1s" },
  { top: "16%", left: "24%", duration: "3.9s", delay: "0.2s" },
  { top: "34%", left: "5%", duration: "4.4s", delay: "0.8s" },
  { top: "40%", left: "46%", duration: "3.5s", delay: "0.4s" },
  { top: "32%", left: "80%", duration: "4.1s", delay: "1.3s" },
  { top: "52%", left: "14%", duration: "3.7s", delay: "0.6s" },
  { top: "56%", left: "60%", duration: "4.5s", delay: "0.9s" },
  { top: "70%", left: "4%", duration: "3.8s", delay: "0.3s" },
  { top: "74%", left: "38%", duration: "4.3s", delay: "1s" },
  { top: "68%", left: "72%", duration: "4s", delay: "0.7s" },
] as const;
