import type { DriveStep } from "driver.js";
import type { Dict } from "@/lib/i18n/types";
import type { NimbusTourStep } from "@/lib/nimbus/tour-catalog";
import { resolveNimbusTourStepCopy } from "@/lib/nimbus/tour-copy";

export const NIMBUS_DRIVER_STEP_DATA_KEY = "nimbusStep";

export interface NimbusDriverStepData {
  step: NimbusTourStep;
  targetMissingLabel: string;
}

export function getNimbusDriverStepData(step: DriveStep): NimbusDriverStepData | null {
  const data = step.data?.[NIMBUS_DRIVER_STEP_DATA_KEY] as NimbusDriverStepData | undefined;
  return data ?? null;
}

export function buildNimbusDriverSteps(
  steps: NimbusTourStep[],
  t: Dict,
  targetMissingLabel: string
): DriveStep[] {
  return steps.map((step) => {
    const copy = resolveNimbusTourStepCopy(t, step.copyKey);
    const isSummary = step.variant === "summary";

    return {
      element: isSummary ? undefined : `[data-nimbus-tour="${step.target}"]`,
      data: {
        [NIMBUS_DRIVER_STEP_DATA_KEY]: {
          step,
          targetMissingLabel,
        } satisfies NimbusDriverStepData,
      },
      popover: {
        title: copy?.title ?? "",
        description: copy?.body ?? "",
        side: isSummary ? undefined : "bottom",
        align: "start",
        popoverClass: isSummary ? "nimbus-driver-popover-summary" : undefined,
      },
    };
  });
}
