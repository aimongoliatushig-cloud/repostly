import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import {
  canUseKie,
  getRunwayTaskDetail,
  mapKieStateToSceneStatus,
} from "@/lib/kie/service";
import {
  setProjectStatus,
  setSceneRenderState,
  updateGenerationJob,
} from "@/lib/projects/service";

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { jobId } = await context.params;
  const brandContext = await getCurrentBrandContext();

  if (!brandContext?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const { data: job, error } = await brandContext.supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!job) {
    return NextResponse.json({ error: "Job олдсонгүй." }, { status: 404 });
  }

  let latestJob = job;

  if (
    canUseKie() &&
    job.provider === "kie" &&
    job.provider_job_id &&
    (job.status === "queued" ||
      job.status === "processing" ||
      job.status === "retrying")
  ) {
    const detail = await getRunwayTaskDetail(job.provider_job_id);
    const nextSceneStatus = mapKieStateToSceneStatus(detail.state);
    const nextJobStatus =
      detail.state === "success"
        ? "succeeded"
        : detail.state === "fail"
          ? "failed"
          : "processing";

    await updateGenerationJob(brandContext.supabase, job.id, {
      status: nextJobStatus,
      response_payload: detail,
      error_message: detail.failMsg,
      finished_at:
        nextJobStatus === "succeeded" || nextJobStatus === "failed"
          ? new Date().toISOString()
          : null,
    });

    if (job.scene_id) {
      await setSceneRenderState(brandContext.supabase, job.scene_id, {
        status: nextSceneStatus,
        providerClipJobId: detail.taskId,
        clipUrl: detail.videoUrl,
        previewUrl: detail.videoUrl,
        errorMessage: detail.failMsg,
      });
    }

    if (detail.state === "fail") {
      await setProjectStatus(
        brandContext.supabase,
        job.project_id,
        "failed",
        detail.failMsg ?? "Scene render амжилтгүй боллоо.",
      );
    }

    latestJob = {
      ...job,
      status: nextJobStatus,
      response_payload: detail,
      error_message: detail.failMsg,
    };
  }

  return NextResponse.json({
    ...latestJob,
    lastCheckedAt: new Date().toISOString(),
  });
}
