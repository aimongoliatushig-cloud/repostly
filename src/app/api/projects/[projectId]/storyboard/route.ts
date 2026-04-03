import { NextResponse } from "next/server";

import { findProject, getScenesForProject } from "@/lib/postly-data";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { projectId } = await context.params;
  const project = findProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Төсөл олдсонгүй." }, { status: 404 });
  }

  return NextResponse.json({
    project,
    scenes: getScenesForProject(projectId),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { projectId } = await context.params;
  const project = findProject(projectId);
  const body = await request.json().catch(() => ({}));

  if (!project) {
    return NextResponse.json({ error: "Төсөл олдсонгүй." }, { status: 404 });
  }

  return NextResponse.json({
    accepted: true,
    projectId,
    scene: {
      id: body.sceneId ?? "scene-unknown",
      visualPrompt: body.visualPrompt ?? "",
      animationPrompt: body.animationPrompt ?? "",
      narration: body.narration ?? "",
    },
    savedAt: new Date().toISOString(),
  });
}
