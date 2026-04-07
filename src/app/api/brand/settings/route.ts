import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import { getBrandSettings, saveBrandSettings } from "@/lib/brands/service";
import { parseRequestData } from "@/lib/http/request";

function getString(body: Record<string, unknown>, key: string) {
  return String(body[key] ?? "").trim();
}

export async function GET() {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const settings = await getBrandSettings(context.supabase, context.brand.id);

  return NextResponse.json({
    brand: settings.brand,
    settings: settings.settings,
    assets: {
      logoUrl: settings.logoSignedUrl,
      frameUrl: settings.frameSignedUrl,
      outroUrl: settings.outroSignedUrl,
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
    hospitalName:
      getString(body, "hospital_name") || getString(body, "name") || context.brand.name,
    phone: getString(body, "phone") || context.brand.phone || "",
    website: getString(body, "website") || context.brand.website || "",
    facebook:
      getString(body, "facebook") ||
      getString(body, "facebookUrl") ||
      context.brand.facebook_url ||
      "",
    addressMn:
      getString(body, "address_mn") ||
      getString(body, "address") ||
      context.brand.address ||
      "",
  });

  const settings = await getBrandSettings(context.supabase, context.brand.id);

  return NextResponse.json({
    accepted: true,
    brand: settings.brand,
    settings: settings.settings,
    assets: {
      logoUrl: settings.logoSignedUrl,
      frameUrl: settings.frameSignedUrl,
      outroUrl: settings.outroSignedUrl,
    },
    updatedAt: new Date().toISOString(),
  });
}
