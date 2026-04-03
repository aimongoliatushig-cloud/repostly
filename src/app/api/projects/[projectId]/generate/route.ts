import { NextResponse } from "next/server";

import { getCurrentBrandContext } from "@/lib/auth/context";
import { getKieCallbackSecret } from "@/lib/env";
import { canUseKie, requestRunwayVideoGeneration } from "@/lib/kie/service";
import { parseRequestData } from "@/lib/http/request";
import {
  createGenerationJob,
  getProjectDetail,
  setProjectStatus,
  setSceneRenderState,
  updateGenerationJob,
} from "@/lib/projects/service";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { projectId } = await context.params;
  const brandContext = await getCurrentBrandContext();

  if (!brandContext?.brand) {
    return NextResponse.json({ error: "Нэвтрэлт шаардлагатай." }, { status: 401 });
  }

  const body = await parseRequestData(request);
  const regenerateSceneId = String(body.regenerateSceneId ?? "").trim() || null;
  const detail = await getProjectDetail(brandContext.supabase, projectId);
  const targetScenes = regenerateSceneId
    ? detail.scenes.filter((scene) => scene.id === regenerateSceneId)
    : detail.scenes;

  if (targetScenes.length === 0) {
    return NextResponse.json(
      { error: "Генерац хийх scene олдсонгүй." },
      { status: 404 },
    );
  }

  if ((brandContext.subscription?.remaining_credits ?? 0) <= 0) {
    return NextResponse.json(
      { error: "Үлдсэн кредит хүрэлцэхгүй байна." },
      { status: 402 },
    );
  }

  await setProjectStatus(brandContext.supabase, projectId, "queued");

  const queuedJobs = await Promise.all(
    targetScenes.map(async (scene) => {
      const job = await createGenerationJob(brandContext.supabase, {
        projectId,
        createdBy: brandContext.user.id,
        sceneId: scene.id,
        provider: "kie",
        jobType: "scene_video",
        requestPayload: {
          prompt: scene.visual_prompt,
          animationPrompt: scene.animation_prompt,
          narration: scene.narration,
        },
      });

      if (!canUseKie()) {
        await updateGenerationJob(brandContext.supabase, job.id, {
          status: "failed",
          error_message: "KIE_API_KEY тохируулаагүй байна.",
        });
        await setSceneRenderState(brandContext.supabase, scene.id, {
          status: "failed",
          errorMessage: "KIE.ai түлхүүр тохируулаагүй тул scene render эхэлсэнгүй.",
        });
        return {
          ...job,
          status: "failed",
          error_message: "KIE_API_KEY тохируулаагүй байна.",
        };
      }

      await setSceneRenderState(brandContext.supabase, scene.id, {
        status: "queued",
        errorMessage: null,
      });

      const callbackUrl = new URL("/api/kie/callback", request.url);
      callbackUrl.searchParams.set("projectId", projectId);
      callbackUrl.searchParams.set("sceneId", scene.id);
      const callbackSecret = getKieCallbackSecret();

      if (callbackSecret) {
        callbackUrl.searchParams.set("token", callbackSecret);
      }

      const prompt = [
        scene.title,
        scene.visual_prompt,
        scene.animation_prompt,
        scene.narration,
      ]
        .filter(Boolean)
        .join(". ");
      const providerJobId = await requestRunwayVideoGeneration({
        prompt,
        durationSeconds: scene.duration_seconds >= 8 ? 10 : 5,
        callbackUrl: callbackUrl.toString(),
      });

      await updateGenerationJob(brandContext.supabase, job.id, {
        status: "processing",
        provider_job_id: providerJobId,
      });
      await setSceneRenderState(brandContext.supabase, scene.id, {
        status: "rendering",
        providerClipJobId: providerJobId,
        errorMessage: null,
      });

      return {
        ...job,
        status: "processing",
        provider_job_id: providerJobId,
      };
    }),
  );

  return NextResponse.json({
    accepted: true,
    projectId,
    mode: regenerateSceneId ? "scene_regenerate" : "full_generation",
    queuedJobs,
    creditReservation: {
      before: brandContext.subscription?.remaining_credits ?? 0,
      afterCompletion: Math.max(
        (brandContext.subscription?.remaining_credits ?? 0) - 1,
        0,
      ),
    },
  });
}
