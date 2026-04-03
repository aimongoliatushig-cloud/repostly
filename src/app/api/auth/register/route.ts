import { NextResponse } from "next/server";

import { parseRequestData, requestWantsJson } from "@/lib/http/request";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const body = await parseRequestData(request);
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "").trim();
  const brandName = String(body.brandName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const nextPath = String(body.next ?? "/dashboard");

  if (!email || !password || !brandName) {
    const message = "Брэндийн нэр, имэйл, нууц үгээ бүрэн оруулна уу.";

    if (requestWantsJson(request)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const url = new URL("/auth", request.url);
    url.searchParams.set("error", message);
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, { status: 303 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: brandName,
        phone,
      },
    },
  });

  if (error || !data.user) {
    const message =
      error?.message || "Бүртгэл амжилтгүй. Өөр имэйл ашиглаад дахин оролдоно уу.";

    if (requestWantsJson(request)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const url = new URL("/auth", request.url);
    url.searchParams.set("error", message);
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, { status: 303 });
  }

  const { data: bootstrapRows, error: bootstrapError } = await supabase.rpc(
    "bootstrap_brand_account",
    {
      target_user_id: data.user.id,
      brand_name: brandName,
      brand_phone: phone || null,
      initial_plan_code: "plan_5",
      requested_slug: null,
    },
  );

  if (bootstrapError) {
    const message =
      "Хэрэглэгч үүслээ, гэхдээ брэндийн эхний тохиргоо дутуу үлдлээ. Дахин нэвтэрч оролдоно уу.";

    if (requestWantsJson(request)) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const url = new URL("/auth", request.url);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url, { status: 303 });
  }

  const brandRow = bootstrapRows?.[0];

  if (requestWantsJson(request)) {
    return NextResponse.json(
      {
        accepted: true,
        message: "Бүртгэл амжилттай.",
        nextStep: "dashboard",
        brand: {
          id: brandRow?.brand_id ?? null,
          name: brandName,
        },
      },
      { status: 201 },
    );
  }

  if (data.session) {
    return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  }

  const url = new URL("/auth", request.url);
  url.searchParams.set(
    "message",
    "Бүртгэл амжилттай. Имэйл баталгаажуулалт шаардлагатай бол имэйлээ шалгана уу.",
  );
  return NextResponse.redirect(url, { status: 303 });
}
