import { buildMonthGrid } from "@/lib/birthdays/calendar";
import { BRAND_COLOR } from "@/lib/constants/brand";
import { SCHEDULE_ENTRY_EMOJI, SCHEDULE_ENTRY_TYPES } from "@/lib/constants/schedule";
import type { ScheduleEntryType } from "@/lib/constants/schedule";
import { openPrintWindow } from "@/lib/print/open-print-window";
import type { ScheduleEntry } from "@/lib/schedule/types";
import {
  getScheduleTypeLabel,
  scheduleDateKey,
  scheduleEntryIncludesDate,
  scheduleEntryOverlapsMonth,
} from "@/lib/schedule/types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type SchedulePrintLabels = {
  title: string;
  subtitle: string;
  weekdays: readonly string[];
  typeLabels: Record<ScheduleEntryType, string>;
};

export function buildSchedulePrintHtml({
  year,
  month,
  entries,
  labels,
  lang,
}: {
  year: number;
  month: number;
  entries: ScheduleEntry[];
  labels: SchedulePrintLabels;
  lang: string;
}): string {
  const entriesByDay = new Map<number, ScheduleEntry[]>();
  const monthEntries = entries.filter((entry) => scheduleEntryOverlapsMonth(entry, year, month));
  const lastDay = new Date(year, month, 0).getDate();

  for (const entry of monthEntries) {
    for (let day = 1; day <= lastDay; day += 1) {
      const dateKey = scheduleDateKey(year, month, day);
      if (!scheduleEntryIncludesDate(entry, dateKey)) continue;
      const list = entriesByDay.get(day) ?? [];
      list.push(entry);
      entriesByDay.set(day, list);
    }
  }

  const cells = buildMonthGrid(year, month);
  const legendItems = SCHEDULE_ENTRY_TYPES.map(
    (type) =>
      `<span class="legend-item"><span class="legend-emoji">${SCHEDULE_ENTRY_EMOJI[type]}</span>${escapeHtml(getScheduleTypeLabel(type, labels.typeLabels))}</span>`
  ).join("");

  const weekdayHeaders = labels.weekdays
    .map((day) => `<th class="weekday">${escapeHtml(day)}</th>`)
    .join("");

  const gridRows: string[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const rowCells = cells.slice(i, i + 7).map((cell) => {
      if (!cell.isCurrentMonth || cell.day === null) {
        return `<td class="cell cell-empty" aria-hidden="true"></td>`;
      }

      const dayEntries = entriesByDay.get(cell.day) ?? [];
      const entryMarkup = dayEntries
        .map((entry) => {
          const typeLabel = escapeHtml(
            getScheduleTypeLabel(entry.entry_type, labels.typeLabels)
          );
          const desc = entry.description.trim()
            ? `<div class="entry-desc">${escapeHtml(entry.description.trim())}</div>`
            : "";
          return `<div class="entry"><span class="entry-emoji">${SCHEDULE_ENTRY_EMOJI[entry.entry_type]}</span> ${typeLabel}${desc}</div>`;
        })
        .join("");

      return `<td class="cell">
        <div class="day-num">${cell.day}</div>
        <div class="entries">${entryMarkup}</div>
      </td>`;
    });

    gridRows.push(`<tr>${rowCells.join("")}</tr>`);
  }

  const c = BRAND_COLOR;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="utf-8" />
  <title>&#8203;</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: ${c.FOREGROUND};
      font-family: "Segoe UI", system-ui, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      padding: 14mm;
    }

    .page {
      width: 100%;
      max-width: 182mm;
      margin: 0 auto;
    }

    h1 {
      margin: 0;
      text-align: center;
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: ${c.PRIMARY_DARK};
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 0.5rem 1.25rem;
      margin: 1.25rem auto 1.5rem;
      max-width: 100%;
      font-size: 0.82rem;
      color: ${c.FOREGROUND};
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      white-space: nowrap;
    }

    .legend-emoji {
      font-size: 1rem;
      line-height: 1;
    }

    .calendar {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid ${c.PRIMARY};
      table-layout: fixed;
    }

    .weekday {
      border: 1px solid ${c.PRIMARY};
      margin: 0;
      padding: 0.45rem 0.25rem;
      text-align: center;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: ${c.PRIMARY};
      color: ${c.PRIMARY_FG};
    }

    .cell {
      border: 1px solid ${c.PRIMARY};
      min-height: 5.4rem;
      height: 5.4rem;
      padding: 0.3rem 0.25rem;
      vertical-align: top;
      text-align: center;
      background: #fff;
    }

    .cell-empty {
      background: ${c.SURFACE};
    }

    .day-num {
      display: block;
      font-size: 0.72rem;
      font-weight: 700;
      margin-bottom: 0.2rem;
      text-align: center;
      color: ${c.PRIMARY_DARK};
    }

    .entries {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      align-items: center;
    }

    .entry {
      width: 100%;
      font-size: 0.62rem;
      line-height: 1.25;
      text-align: center;
      word-break: break-word;
      color: ${c.PRIMARY_DARK};
      background: ${c.ENTRY_BG};
      border-radius: 2px;
      padding: 0.1rem 0.15rem;
    }

    .entry-emoji {
      font-size: 0.72rem;
    }

    .entry-desc {
      margin-top: 0.1rem;
      font-size: 0.58rem;
      color: ${c.MUTED_FG};
    }
  </style>
</head>
<body>
  <div class="page">
    <h1>${escapeHtml(labels.subtitle)}</h1>
    <div class="legend">${legendItems}</div>
    <table class="calendar">
      <thead>
        <tr>${weekdayHeaders}</tr>
      </thead>
      <tbody>
        ${gridRows.join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

export function openSchedulePrintWindow(html: string): boolean {
  return openPrintWindow(html);
}
