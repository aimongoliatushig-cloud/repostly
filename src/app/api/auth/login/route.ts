import { NextResponse } from "next/server";

import { getCurrentMembership } from "@/lib/auth/context";
import { parseRequestData, requestWantsJson } from "@/lib/http/request";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const body = await parseRequestData(request);
  const email = String(body.emailOrPhone ?? body.email ?? "").trim();
  const password = String(body.password ?? "").trim();
  const nextPath = String(body.next ?? "/dashboard");

  if (!email || !password) {
    if (requestWantsJson(request)) {
      return NextResponse.json(
        { error: "Имэйл болон нууц үгээ бүрэн оруулна уу." },
        { status: 400 },
      );
    }

    const url = new URL("/auth", request.url);
    url.searchParams.set("error", "Имэйл болон нууц үгээ бүрэн оруулна уу.");
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, { status: 303 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    const message = "Нэвтрэлт амжилтгүй. Имэйл эсвэл нууц үгээ шалгана уу.";

    if (requestWantsJson(request)) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const url = new URL("/auth", request.url);
    url.searchParams.set("error", message);
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, { status: 303 });
  }

  const membershipState = await getCurrentMembership(supabase, data.user.id);

  if (!membershipState) {
    await supabase.auth.signOut();
    const message = "Таны хэрэглэгч дээр идэвхтэй брэнд холбогдоогүй байна.";

    if (requestWantsJson(request)) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    const url = new URL("/auth", request.url);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url, { status: 303 });
  }

  if (requestWantsJson(request)) {
    return NextResponse.json({
      accepted: true,
      session: {
        role: membershipState.membership.role,
        activeBrand: {
          id: membershipState.brand.id,
          name: membershipState.brand.name,
        },
      },
    });
  }

  return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
}
