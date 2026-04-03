import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import { getBrandSettings, saveBrandSettings } from "@/lib/brands/service";
import { parseRequestData } from "@/lib/http/request";

export async function GET() {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const settings = await getBrandSettings(context.supabase, context.brand.id);

  return NextResponse.json({
    brand: settings.brand,
    assets: {
      logoUrl: settings.logoUrl,
      frameUrl: settings.frameUrl,
      outroUrl: settings.outroUrl,
    },
  });
}

export async function PATCH(request: Request) {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const body = await parseRequestData(request);

  await saveBrandSettings(context.supabase, {
    brandId: context.brand.id,
    userId: context.user.id,
    name: String(body.name ?? context.brand.name),
    phone: String(body.phone ?? context.brand.phone ?? ""),
    website: String(body.website ?? context.brand.website ?? ""),
    facebookUrl: String(
      body.facebookUrl ?? body.facebook ?? context.brand.facebook_url ?? "",
    ),
    address: String(body.address ?? context.brand.address ?? ""),
  });

  const settings = await getBrandSettings(context.supabase, context.brand.id);

  return NextResponse.json({
    accepted: true,
    brand: settings.brand,
    assets: {
      logoUrl: settings.logoUrl,
      frameUrl: settings.frameUrl,
      outroUrl: settings.outroUrl,
    },
    updatedAt: new Date().toISOString(),
  });
}
