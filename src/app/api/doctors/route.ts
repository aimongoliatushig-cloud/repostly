import { NextResponse } from "next/server";

import { doctors } from "@/lib/postly-data";

export function GET() {
  return NextResponse.json({
    items: doctors,
    total: doctors.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!body.fullName || !body.specialization || !body.brandName) {
    return NextResponse.json(
      { error: "fullName, specialization, brandName талбарууд шаардлагатай." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      accepted: true,
      doctor: {
        id: "doc-new",
        fullName: body.fullName,
        specialization: body.specialization,
        brandName: body.brandName,
        initials: "ШЭ",
        availability: "Зураг хүлээгдэж байна",
      },
    },
    { status: 201 },
  );
}
