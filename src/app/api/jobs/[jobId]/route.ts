import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Phase 1 дээр async job polling идэвхгүй байна. Одоогоор doctor image болон brand asset storage урсгал ажиллана.",
    },
    { status: 410 },
  );
}
