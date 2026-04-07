import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Phase 1 дээр storyboard API идэвхгүй байна. Одоогоор doctor болон brand management л ажиллана.",
    },
    { status: 410 },
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      error:
        "Phase 1 дээр storyboard API идэвхгүй байна. Одоогоор doctor болон brand management л ажиллана.",
    },
    { status: 410 },
  );
}
