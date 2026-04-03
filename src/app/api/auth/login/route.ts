import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!body.emailOrPhone || !body.password) {
    return NextResponse.json(
      { error: "emailOrPhone болон password шаардлагатай." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    accepted: true,
    message: "Supabase session үүсгэх contract бэлэн.",
    session: {
      accessToken: "demo-session-token",
      role: "brand",
      activeBrand: {
        id: "brand-sergeen",
        name: "Сэргээн Клиник",
      },
    },
  });
}
