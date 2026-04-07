import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Phase 1 дээр scene generation API идэвхгүй байна. Doctor image болон brand asset хадгалалт л ажиллана.",
    },
    { status: 410 },
  );
}
