import { NextResponse } from "next/server";

import { formatMnt, subscriptionPlans } from "@/lib/postly-data";

export function GET() {
  return NextResponse.json({
    plans: subscriptionPlans.map((plan) => ({
      ...plan,
      priceFormatted: formatMnt(plan.priceMnt),
    })),
    currentSubscription: {
      planId: "plan_10",
      remainingCredits: 8,
      renewsAt: "2026-05-03T00:00:00.000Z",
    },
    creditPolicy: "completed_video бүр 1 кредит хасна",
  });
}
