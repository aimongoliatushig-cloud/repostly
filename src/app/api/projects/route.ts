import { NextResponse } from "next/server";

const disabledResponse = {
  error:
    "Phase 1 дээр project generation API идэвхгүй байна. Одоогоор зөвхөн doctor зураг болон brand asset хадгалалт ажиллана.",
};

export async function GET() {
  return NextResponse.json(disabledResponse, { status: 410 });
}

export async function POST() {
  return NextResponse.json(disabledResponse, { status: 410 });
}
