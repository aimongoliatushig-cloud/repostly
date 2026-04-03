import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!body.email || !body.password || !body.brandName) {
    return NextResponse.json(
      { error: "email, password, brandName талбарууд шаардлагатай." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      accepted: true,
      message: "Brand, profile, default membership scaffold бэлэн.",
      nextStep: "brand-settings",
      brand: {
        id: "brand-new",
        name: body.brandName,
      },
    },
    { status: 201 },
  );
}
