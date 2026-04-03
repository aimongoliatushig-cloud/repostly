import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import { parseRequestData } from "@/lib/http/request";
import { generateBrollPlan, generateOrganPlan } from "@/lib/openai/service";
import {
  createProjectDraft,
  listProjects,
  replaceProjectScenes,
  updateProject,
} from "@/lib/projects/service";

export async function GET() {
  const context = await getCurrentBrandContext();

  if (!context?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const items = await listProjects(context.supabase, context.brand.id);

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
  const contentType = String(body.contentType ?? "");

  if (
    contentType !== "b_roll_head_explainer" &&
    contentType !== "organ_talk"
  ) {
    return NextResponse.json(
      { error: "contentType нь b_roll_head_explainer эсвэл organ_talk байх ёстой." },
      { status: 400 },
    );
  }

  if ((context.subscription?.remaining_credits ?? 0) <= 0) {
    return NextResponse.json(
      { error: "Үлдсэн кредит хүрэлцэхгүй байна." },
      { status: 402 },
    );
  }

  const durationLimitSeconds =
    contentType === "b_roll_head_explainer" ? 45 : 40;

  const title = String(body.title ?? "").trim();
  const draft = await createProjectDraft(context.supabase, {
    brandId: context.brand.id,
    userId: context.user.id,
    title:
      title ||
      (contentType === "b_roll_head_explainer"
        ? "Шинэ B-roll төсөл"
        : "Шинэ organ talk төсөл"),
    contentType,
    doctorId: String(body.doctorId ?? "").trim() || null,
    organAvatarId: String(body.organAvatarId ?? "").trim() || null,
    durationLimitSeconds,
    applyFrame: String(body.applyFrame ?? "") === "true",
    applyOutro: String(body.applyOutro ?? "") === "true",
  });

  let planNote: string | undefined;

  if (contentType === "b_roll_head_explainer" && draft.doctor_id) {
    const { data: doctor } = await context.supabase
      .from("doctors")
      .select("*")
      .eq("id", draft.doctor_id)
      .single();

    if (doctor) {
      const plan = await generateBrollPlan({
        doctorName: doctor.full_name,
        specialization: doctor.specialization,
        brandName: context.brand.name,
      });
      planNote = plan.providerNote;
      await updateProject(context.supabase, draft.id, {
        title: plan.title,
        topic: plan.topic,
        hook: plan.hook,
        script_text: plan.scriptText,
        cta_text: plan.ctaText,
        estimated_duration_seconds: plan.estimatedDurationSeconds,
        status: "planning",
        metadata: {
          planningProvider: plan.provider,
          planningNote: plan.providerNote ?? null,
        },
      });
      await replaceProjectScenes(context.supabase, draft.id, plan.scenes);
    }
  }

  if (contentType === "organ_talk" && draft.organ_avatar_id) {
    const { data: organ } = await context.supabase
      .from("organ_avatars")
      .select("*")
      .eq("id", draft.organ_avatar_id)
      .single();

    if (organ) {
      const plan = await generateOrganPlan({
        organLabel: organ.label,
        organDescription: organ.description,
        brandName: context.brand.name,
      });
      planNote = plan.providerNote;
      await updateProject(context.supabase, draft.id, {
        title: plan.title,
        topic: plan.topic,
        hook: plan.hook,
        script_text: plan.scriptText,
        cta_text: plan.ctaText,
        estimated_duration_seconds: plan.estimatedDurationSeconds,
        status: "planning",
        metadata: {
          planningProvider: plan.provider,
          planningNote: plan.providerNote ?? null,
        },
      });
      await replaceProjectScenes(context.supabase, draft.id, plan.scenes);
    }
  }

  return NextResponse.json(
    {
      accepted: true,
      creditCheck: {
        remainingCredits: context.subscription?.remaining_credits ?? 0,
        canGenerate: (context.subscription?.remaining_credits ?? 0) > 0,
      },
      project: draft,
      durationLimitSeconds,
      planningNote: planNote ?? null,
    },
    { status: 201 },
  );
}
