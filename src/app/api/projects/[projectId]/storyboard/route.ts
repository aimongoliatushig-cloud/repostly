import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import { parseRequestData } from "@/lib/http/request";
import { getProjectDetail, updateScene } from "@/lib/projects/service";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { projectId } = await context.params;
  const brandContext = await getCurrentBrandContext();

  if (!brandContext?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const project = await getProjectDetail(brandContext.supabase, projectId);

  return NextResponse.json({
    project: project.project,
    scenes: project.scenes,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { projectId } = await context.params;
  const brandContext = await getCurrentBrandContext();

  if (!brandContext?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const body = await parseRequestData(request);
  const sceneId = String(body.sceneId ?? "").trim();

  if (!sceneId) {
    return NextResponse.json({ error: "sceneId шаардлагатай." }, { status: 400 });
  }

  await updateScene(brandContext.supabase, sceneId, {
    title: String(body.title ?? "").trim() || undefined,
    visual_prompt: String(body.visualPrompt ?? "").trim() || undefined,
    animation_prompt: String(body.animationPrompt ?? "").trim() || undefined,
    narration: String(body.narration ?? "").trim() || undefined,
    status: "editable",
    error_message: null,
  });

  return NextResponse.json({
    accepted: true,
    projectId,
    sceneId,
    savedAt: new Date().toISOString(),
  });
}
