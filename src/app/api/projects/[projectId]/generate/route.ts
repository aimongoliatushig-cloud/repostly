import { NextResponse } from "next/server";

import { findProject, queueJobs } from "@/lib/postly-data";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { projectId } = await context.params;
  const project = findProject(projectId);
  const body = await request.json().catch(() => ({}));

  if (!project) {
    return NextResponse.json({ error: "Төсөл олдсонгүй." }, { status: 404 });
  }

  return NextResponse.json({
    accepted: true,
    projectId,
    mode: body.regenerateSceneId ? "scene_regenerate" : "full_generation",
    queuedJobs:
      queueJobs.filter((job) => job.projectId === projectId).length > 0
        ? queueJobs.filter((job) => job.projectId === projectId)
        : [
            {
              id: "job-new-openai",
              jobType: "script",
              provider: "openai",
              status: "queued",
            },
            {
              id: "job-new-kie",
              jobType: "scene_video",
              provider: "kie",
              status: "queued",
            },
            {
              id: "job-new-merge",
              jobType: "merge",
              provider: "system",
              status: "queued",
            },
          ],
    creditReservation: {
      before: 8,
      afterCompletion: 7,
    },
  });
}
