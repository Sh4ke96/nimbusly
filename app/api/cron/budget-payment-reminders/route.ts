import { NextResponse } from "next/server";
import { processBudgetPaymentReminders } from "@/lib/budget/process-payment-reminders";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { sent, errors } = await processBudgetPaymentReminders(supabase);

  return NextResponse.json({ sent, errors });
}
