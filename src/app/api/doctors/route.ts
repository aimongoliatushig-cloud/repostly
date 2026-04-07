import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import { parseRequestData } from "@/lib/http/request";
import {
  createDoctor,
  deleteDoctor,
  listDoctors,
  updateDoctor,
} from "@/lib/doctors/service";

function getString(body: Record<string, unknown>, key: string) {
  return String(body[key] ?? "").trim();
}

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
  const nameMn = getString(body, "name_mn") || getString(body, "fullName");
  const specialtyMn =
    getString(body, "specialty_mn") || getString(body, "specialization");

  if (!nameMn || !specialtyMn) {
    return NextResponse.json(
      { error: "Эмчийн нэр, мэргэжлийг бүрэн оруулна уу." },
      { status: 400 },
    );
  }

  await createDoctor(context.supabase, {
    brandId: context.brand.id,
    userId: context.user.id,
    nameMn,
    specialtyMn,
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
  const doctorId = getString(body, "doctor_id") || getString(body, "doctorId");
  const action = getString(body, "action") || "update";

  if (!doctorId) {
    return NextResponse.json({ error: "doctor_id шаардлагатай." }, { status: 400 });
  }

  if (action === "delete") {
    await deleteDoctor(context.supabase, {
      brandId: context.brand.id,
      doctorId,
    });
  } else {
    await updateDoctor(context.supabase, {
      doctorId,
      brandId: context.brand.id,
      nameMn: getString(body, "name_mn") || getString(body, "fullName"),
      specialtyMn:
        getString(body, "specialty_mn") || getString(body, "specialization"),
    });
  }

  const items = await listDoctors(context.supabase, context.brand.id);

  return NextResponse.json({
    accepted: true,
    items,
  });
}
