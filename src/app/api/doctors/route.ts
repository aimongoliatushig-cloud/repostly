import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import { parseRequestData } from "@/lib/http/request";
import {
  archiveDoctor,
  createDoctor,
  listDoctors,
  updateDoctor,
} from "@/lib/doctors/service";

export async function GET() {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const items = await listDoctors(context.supabase, context.brand.id);

  return NextResponse.json({
    items,
    total: items.length,
  });
}

export async function POST(request: Request) {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const body = await parseRequestData(request);
  const fullName = String(body.fullName ?? "").trim();
  const specialization = String(body.specialization ?? "").trim();

  if (!fullName || !specialization) {
    return NextResponse.json(
      { error: "Эмчийн нэр болон мэргэжлийг бүрэн оруулна уу." },
      { status: 400 },
    );
  }

  await createDoctor(context.supabase, {
    brandId: context.brand.id,
    userId: context.user.id,
    fullName,
    specialization,
  });

  const items = await listDoctors(context.supabase, context.brand.id);

  return NextResponse.json(
    {
      accepted: true,
      items,
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const body = await parseRequestData(request);
  const doctorId = String(body.doctorId ?? "").trim();
  const action = String(body.action ?? "update").trim();

  if (!doctorId) {
    return NextResponse.json({ error: "doctorId шаардлагатай." }, { status: 400 });
  }

  if (action === "archive") {
    await archiveDoctor(context.supabase, doctorId);
  } else {
    await updateDoctor(context.supabase, {
      doctorId,
      brandId: context.brand.id,
      fullName: String(body.fullName ?? "").trim(),
      specialization: String(body.specialization ?? "").trim(),
    });
  }

  const items = await listDoctors(context.supabase, context.brand.id);

  return NextResponse.json({
    accepted: true,
    items,
  });
}
