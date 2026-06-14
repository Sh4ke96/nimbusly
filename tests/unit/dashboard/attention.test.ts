import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHORE_STATUS } from "@/lib/constants/chores";
import { APP_MODULE, APP_MODULE_ROUTES } from "@/lib/constants/app-modules";
import { MEDICINE_AVAILABILITY } from "@/lib/constants/medicine";
import { PET_CARE_TYPE } from "@/lib/constants/pets";
import { buildAttentionItems } from "@/lib/dashboard/attention";

const labels = {
  choreOverdue: (title: string) => `chore:${title}`,
  medicineExpiring: (name: string) => `med:${name}`,
  petCareDue: (pet: string, item: string) => `pet:${pet}:${item}`,
  birthdaySoon: (name: string, when: string) => `bday:${name}:${when}`,
  birthdayToday: "today",
  birthdayInDays: (count: string) => `in ${count} days`,
};

describe("buildAttentionItems", () => {
  it("aggregates overdue chores and expiring medicine", () => {
    const items = buildAttentionItems({
      choreTasks: [
        {
          id: "1",
          family_id: null,
          title: "Śmieci",
          notes: "",
          status: CHORE_STATUS.PENDING,
          assigned_to: null,
          due_date: "2026-06-01",
          recurrence: "none",
          completed_at: null,
          created_by: "u1",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ],
      medicineItems: [
        {
          id: "m1",
          family_id: null,
          name: "Apap",
          form_type: "tablets",
          quantity: "",
          expiry_date: "2026-06-20",
          availability: MEDICINE_AVAILABILITY.IN_STOCK,
          location: "",
          notes: "",
          created_by: "u1",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ],
      careItems: [],
      pets: [],
      birthdays: [],
      labels,
      limit: 10,
    });

    assert.ok(items.some((item) => item.href === APP_MODULE_ROUTES[APP_MODULE.CHORES]));
    assert.ok(items.some((item) => item.href === APP_MODULE_ROUTES[APP_MODULE.MEDICINE_CABINET]));
  });

  it("includes pet care due soon", () => {
    const items = buildAttentionItems({
      choreTasks: [],
      medicineItems: [],
      careItems: [
        {
          id: "c1",
          pet_id: "p1",
          family_id: null,
          name: "Szczepienie",
          care_type: PET_CARE_TYPE.VACCINATION,
          last_done_at: null,
          next_due_date: "2026-06-01",
          stock_status: null,
          quantity: "",
          notes: "",
          created_by: "u1",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ],
      pets: [
        {
          id: "p1",
          family_id: null,
          name: "Burek",
          species: "dog",
          notes: "",
          created_by: "u1",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ],
      birthdays: [],
      labels,
    });

    assert.equal(items.length, 1);
    assert.equal(items[0].href, "/pets");
  });
});
