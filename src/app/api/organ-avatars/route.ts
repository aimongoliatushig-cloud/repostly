import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";

export async function GET() {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const { data, error } = await context.supabase
    .from("organ_avatars")
    .select("*")
    .eq("is_active", true)
    .order("label", { ascending: true });

  if (error) {
    throw error;
  }

  return NextResponse.json({
    items: data ?? [],
  });
}
