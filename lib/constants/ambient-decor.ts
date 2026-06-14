import { APP_MODULE } from "@/lib/constants/app-modules";
import type { AppModuleId } from "@/lib/constants/app-modules";

export type AmbientShapeConfig = {
  id: string;
  kind: "ring" | "square" | "house" | "heart" | "dash";
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: number;
  rotate: number;
  duration: string;
  delay: string;
  opacity: number;
};

export type AmbientIconConfig = {
  key: AppModuleId;
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  opacity: number;
};

export type AmbientVariant = "auth" | "app" | "landing";

const AUTH_SHAPES: AmbientShapeConfig[] = [
  { id: "ring-1", kind: "ring", top: "6%", left: "4%", size: 140, rotate: -12, duration: "24s", delay: "0s", opacity: 0.35 },
  { id: "square-1", kind: "square", top: "12%", right: "6%", size: 96, rotate: 18, duration: "20s", delay: "-3s", opacity: 0.3 },
  { id: "house-1", kind: "house", bottom: "18%", left: "8%", size: 110, rotate: -6, duration: "26s", delay: "-5s", opacity: 0.28 },
  { id: "heart-1", kind: "heart", top: "42%", left: "2%", size: 48, rotate: 8, duration: "16s", delay: "-2s", opacity: 0.32 },
  { id: "ring-2", kind: "ring", bottom: "8%", right: "12%", size: 180, rotate: 24, duration: "28s", delay: "-7s", opacity: 0.25 },
  { id: "square-2", kind: "square", top: "55%", right: "3%", size: 72, rotate: -20, duration: "22s", delay: "-4s", opacity: 0.28 },
  { id: "dash-1", kind: "dash", top: "28%", left: "38%", size: 120, rotate: 35, duration: "30s", delay: "-1s", opacity: 0.2 },
  { id: "house-2", kind: "house", top: "8%", left: "42%", size: 80, rotate: 10, duration: "25s", delay: "-6s", opacity: 0.22 },
  { id: "heart-2", kind: "heart", bottom: "32%", right: "28%", size: 40, rotate: -14, duration: "18s", delay: "-3s", opacity: 0.3 },
];

const APP_SHAPES: AmbientShapeConfig[] = [
  { id: "ring-1", kind: "ring", top: "4%", right: "5%", size: 120, rotate: 15, duration: "26s", delay: "0s", opacity: 0.22 },
  { id: "square-1", kind: "square", top: "20%", left: "3%", size: 80, rotate: -18, duration: "22s", delay: "-4s", opacity: 0.18 },
  { id: "house-1", kind: "house", bottom: "12%", left: "6%", size: 90, rotate: 6, duration: "28s", delay: "-2s", opacity: 0.2 },
  { id: "heart-1", kind: "heart", top: "38%", right: "4%", size: 36, rotate: -8, duration: "17s", delay: "-5s", opacity: 0.22 },
  { id: "ring-2", kind: "ring", bottom: "6%", right: "18%", size: 150, rotate: -22, duration: "30s", delay: "-8s", opacity: 0.16 },
  { id: "dash-1", kind: "dash", top: "60%", left: "12%", size: 100, rotate: -30, duration: "32s", delay: "-1s", opacity: 0.14 },
];

const AUTH_ICONS: AmbientIconConfig[] = [
  { key: APP_MODULE.BUDGET, top: "14%", left: "72%", size: 28, duration: "19s", delay: "0s", opacity: 0.2 },
  { key: APP_MODULE.SHOPPING, top: "72%", left: "18%", size: 24, duration: "21s", delay: "-3s", opacity: 0.18 },
  { key: APP_MODULE.GIFTS, top: "24%", left: "88%", size: 22, duration: "17s", delay: "-6s", opacity: 0.16 },
  { key: APP_MODULE.BIRTHDAYS, top: "78%", left: "78%", size: 26, duration: "23s", delay: "-2s", opacity: 0.18 },
  { key: APP_MODULE.CALENDAR, top: "48%", left: "92%", size: 24, duration: "20s", delay: "-4s", opacity: 0.15 },
  { key: APP_MODULE.CHORES, top: "62%", left: "4%", size: 22, duration: "18s", delay: "-7s", opacity: 0.17 },
  { key: APP_MODULE.PETS, top: "10%", left: "22%", size: 24, duration: "22s", delay: "-5s", opacity: 0.16 },
  { key: APP_MODULE.FAMILY, top: "86%", left: "48%", size: 26, duration: "24s", delay: "-1s", opacity: 0.17 },
];

const APP_ICONS: AmbientIconConfig[] = [
  { key: APP_MODULE.BUDGET, top: "8%", left: "90%", size: 24, duration: "20s", delay: "0s", opacity: 0.12 },
  { key: APP_MODULE.SHOPPING, top: "22%", left: "6%", size: 22, duration: "22s", delay: "-4s", opacity: 0.1 },
  { key: APP_MODULE.GIFTS, top: "75%", left: "92%", size: 20, duration: "18s", delay: "-2s", opacity: 0.11 },
  { key: APP_MODULE.BIRTHDAYS, top: "88%", left: "14%", size: 22, duration: "24s", delay: "-6s", opacity: 0.1 },
  { key: APP_MODULE.CALENDAR, top: "45%", left: "3%", size: 20, duration: "19s", delay: "-3s", opacity: 0.09 },
  { key: APP_MODULE.MEDICINE_CABINET, top: "12%", left: "48%", size: 20, duration: "21s", delay: "-5s", opacity: 0.08 },
  { key: APP_MODULE.WATCHLIST, top: "58%", left: "95%", size: 20, duration: "23s", delay: "-1s", opacity: 0.1 },
  { key: APP_MODULE.CHORES, top: "68%", left: "8%", size: 22, duration: "17s", delay: "-7s", opacity: 0.11 },
  { key: APP_MODULE.PETS, top: "32%", left: "88%", size: 20, duration: "25s", delay: "-8s", opacity: 0.09 },
  { key: APP_MODULE.RESTAURANTS, top: "92%", left: "72%", size: 20, duration: "20s", delay: "-4s", opacity: 0.1 },
];

export function getAmbientShapes(variant: AmbientVariant) {
  return variant === "app" ? APP_SHAPES : AUTH_SHAPES;
}

export function getAmbientIcons(variant: AmbientVariant) {
  return variant === "app" ? APP_ICONS : AUTH_ICONS;
}
