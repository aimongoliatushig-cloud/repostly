import { NextResponse } from "next/server";

import { brandSettings } from "@/lib/postly-data";

export function GET() {
  return NextResponse.json({
    brand: brandSettings,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    accepted: true,
    brand: {
      ...brandSettings,
      ...body,
    },
    updatedAt: new Date().toISOString(),
  });
}
