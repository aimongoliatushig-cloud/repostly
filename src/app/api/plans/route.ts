import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import { getActiveSubscription, getPlanCatalog, listCreditLedger } from "@/lib/brands/service";

function formatMnt(value: number) {
  return `${new Intl.NumberFormat("mn-MN").format(value)} ₮`;
}

export async function GET() {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const [plans, currentSubscription, ledger] = await Promise.all([
    getPlanCatalog(context.supabase),
    getActiveSubscription(context.supabase, context.brand.id),
    listCreditLedger(context.supabase, context.brand.id, 20),
  ]);

  return NextResponse.json({
    plans: plans.map((plan) => ({
      ...plan,
      priceFormatted: formatMnt(plan.price_mnt),
    })),
    currentSubscription,
    creditLedger: ledger,
    creditPolicy: "completed_video бүр 1 кредит хасна",
  });
}
