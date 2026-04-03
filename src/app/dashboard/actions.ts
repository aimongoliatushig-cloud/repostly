"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings, saveBrandSettings } from "@/lib/brands/service";
import { archiveDoctor, createDoctor, updateDoctor } from "@/lib/doctors/service";
import { getKieCallbackSecret } from "@/lib/env";
import { generateBrollPlan, generateOrganPlan } from "@/lib/openai/service";
import {
  canUseKie,
  getRunwayTaskDetail,
  mapKieStateToSceneStatus,
  requestRunwayVideoGeneration,
} from "@/lib/kie/service";
import { mergeProjectVideo } from "@/lib/merge/service";
import {
  consumeProjectCredit,
  createGenerationJob,
  createProjectDraft,
  getProjectDetail,
  replaceProjectScenes,
  setProjectStatus,
  setSceneRenderState,
  updateGenerationJob,
  updateProject,
  updateScene,
} from "@/lib/projects/service";
import type { TableRow } from "@/lib/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function redirectWithMessage(
  pathname: string,
  options: {
    message?: string;
    error?: string;
  },
): never {
  const params = new URLSearchParams();

  if (options.message) {
    params.set("message", options.message);
  }

  if (options.error) {
    params.set("error", options.error);
  }

  const suffix = params.toString();
  return redirect(suffix ? `${pathname}?${suffix}` : pathname);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}

export async function saveBrandSettingsAction(formData: FormData) {
  try {
    const context = await requireBrandContext("/dashboard/settings");
    const name = getString(formData, "name");

    if (!name) {
      redirectWithMessage("/dashboard/settings", {
        error: "Брэндийн нэр хоосон байж болохгүй.",
      });
    }

    await saveBrandSettings(context.supabase, {
      brandId: context.brand.id,
      userId: context.user.id,
      name,
      phone: getString(formData, "phone"),
      website: getString(formData, "website"),
      facebookUrl: getString(formData, "facebookUrl"),
      address: getString(formData, "address"),
      logoFile: getFile(formData, "logoFile"),
      frameFile: getFile(formData, "frameFile"),
      outroFile: getFile(formData, "outroFile"),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    redirectWithMessage("/dashboard/settings", {
      message: "Брэндийн тохиргоо хадгалагдлаа.",
    });
  } catch (error) {
    redirectWithMessage("/dashboard/settings", {
      error: getErrorMessage(error, "Тохиргоо хадгалах үед алдаа гарлаа."),
    });
  }
}

export async function createDoctorAction(formData: FormData) {
  try {
    const context = await requireBrandContext("/dashboard/doctors");

    await createDoctor(context.supabase, {
      brandId: context.brand.id,
      userId: context.user.id,
      fullName: getString(formData, "fullName"),
      specialization: getString(formData, "specialization"),
      imageFile: getFile(formData, "imageFile"),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/doctors");
    redirectWithMessage("/dashboard/doctors", {
      message: "Эмч амжилттай нэмэгдлээ.",
    });
  } catch (error) {
    redirectWithMessage("/dashboard/doctors", {
      error: getErrorMessage(error, "Эмч нэмэх үед алдаа гарлаа."),
    });
  }
}

export async function updateDoctorAction(formData: FormData) {
  try {
    const context = await requireBrandContext("/dashboard/doctors");
    const doctorId = getString(formData, "doctorId");

    await updateDoctor(context.supabase, {
      doctorId,
      brandId: context.brand.id,
      fullName: getString(formData, "fullName"),
      specialization: getString(formData, "specialization"),
      imageFile: getFile(formData, "imageFile"),
    });

    revalidatePath("/dashboard/doctors");
    redirectWithMessage("/dashboard/doctors", {
      message: "Эмчийн мэдээлэл шинэчлэгдлээ.",
    });
  } catch (error) {
    redirectWithMessage("/dashboard/doctors", {
      error: getErrorMessage(error, "Эмч шинэчлэх үед алдаа гарлаа."),
    });
  }
}

export async function archiveDoctorAction(formData: FormData) {
  const context = await requireBrandContext("/dashboard/doctors");
  const doctorId = getString(formData, "doctorId");

  await archiveDoctor(context.supabase, doctorId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/doctors");
  redirectWithMessage("/dashboard/doctors", {
    message: "Эмч архивлагдлаа.",
  });
}

async function createPlannedProject(
  input: {
    type: TableRow<"video_projects">["content_type"];
    title: string;
    doctorId?: string | null;
    organAvatarId?: string | null;
    sourceAudioFile?: File | null;
    applyFrame?: boolean;
    applyOutro?: boolean;
  },
) {
  const context = await requireBrandContext(
    input.type === "b_roll_head_explainer" ? "/dashboard/broll" : "/dashboard/organ",
  );

  if ((context.subscription?.remaining_credits ?? 0) <= 0) {
    redirectWithMessage(
      input.type === "b_roll_head_explainer" ? "/dashboard/broll" : "/dashboard/organ",
      {
        error: "Үлдсэн кредит хүрэлцэхгүй байна.",
      },
    );
  }

  const draft = await createProjectDraft(context.supabase, {
    brandId: context.brand.id,
    userId: context.user.id,
    title: input.title,
    contentType: input.type,
    doctorId: input.doctorId ?? null,
    organAvatarId: input.organAvatarId ?? null,
    durationLimitSeconds: input.type === "b_roll_head_explainer" ? 45 : 40,
    applyFrame: input.applyFrame,
    applyOutro: input.applyOutro,
    sourceAudioFile: input.sourceAudioFile,
  });

  if (input.type === "b_roll_head_explainer" && draft.doctor_id) {
    const { data: doctor, error } = await context.supabase
      .from("doctors")
      .select("*")
      .eq("id", draft.doctor_id)
      .single();

    if (error || !doctor) {
      throw error ?? new Error("Эмчийн мэдээлэл олдсонгүй.");
    }

    const plan = await generateBrollPlan({
      doctorName: doctor.full_name,
      specialization: doctor.specialization,
      brandName: context.brand.name,
    });

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

  if (input.type === "organ_talk" && draft.organ_avatar_id) {
    const { data: organ, error } = await context.supabase
      .from("organ_avatars")
      .select("*")
      .eq("id", draft.organ_avatar_id)
      .single();

    if (error || !organ) {
      throw error ?? new Error("Орган avatar олдсонгүй.");
    }

    const plan = await generateOrganPlan({
      organLabel: organ.label,
      organDescription: organ.description,
      brandName: context.brand.name,
    });

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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  redirectWithMessage(`/dashboard/projects/${draft.id}`, {
    message: "Төсөл үүсэж, storyboard бэлтгэгдлээ.",
  });
}

export async function createBrollProjectAction(formData: FormData) {
  try {
    const doctorId = getString(formData, "doctorId");
    const audioFile = getFile(formData, "audioFile");

    if (!doctorId || !audioFile) {
      redirectWithMessage("/dashboard/broll", {
        error: "Эмч болон MP3 аудиогоо бүрэн сонгоно уу.",
      });
    }

    await createPlannedProject({
      type: "b_roll_head_explainer",
      title: getString(formData, "title") || "Шинэ B-roll төсөл",
      doctorId,
      sourceAudioFile: audioFile,
      applyFrame: formData.get("applyFrame") === "on",
      applyOutro: formData.get("applyOutro") === "on",
    });
  } catch (error) {
    redirectWithMessage("/dashboard/broll", {
      error: getErrorMessage(error, "B-roll төсөл үүсгэх үед алдаа гарлаа."),
    });
  }
}

export async function createOrganProjectAction(formData: FormData) {
  try {
    const organAvatarId = getString(formData, "organAvatarId");

    if (!organAvatarId) {
      redirectWithMessage("/dashboard/organ", {
        error: "Орган avatar сонгоно уу.",
      });
    }

    await createPlannedProject({
      type: "organ_talk",
      title: getString(formData, "title") || "Шинэ Organ talk төсөл",
      organAvatarId,
      applyFrame: formData.get("applyFrame") === "on",
      applyOutro: formData.get("applyOutro") === "on",
    });
  } catch (error) {
    redirectWithMessage("/dashboard/organ", {
      error: getErrorMessage(error, "Organ talk төсөл үүсгэх үед алдаа гарлаа."),
    });
  }
}

export async function saveSceneAction(formData: FormData) {
  const context = await requireBrandContext("/dashboard/projects");
  const projectId = getString(formData, "projectId");
  const sceneId = getString(formData, "sceneId");

  await updateScene(context.supabase, sceneId, {
    title: getString(formData, "title"),
    narration: getString(formData, "narration"),
    visual_prompt: getString(formData, "visualPrompt"),
    animation_prompt: getString(formData, "animationPrompt"),
    status: "editable",
    error_message: null,
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  redirectWithMessage(`/dashboard/projects/${projectId}`, {
    message: "Scene хадгалагдлаа.",
  });
}

export async function regeneratePlanningAction(formData: FormData) {
  const context = await requireBrandContext("/dashboard/projects");
  const projectId = getString(formData, "projectId");
  const detail = await getProjectDetail(context.supabase, projectId);

  if (
    detail.project.content_type === "b_roll_head_explainer" &&
    detail.project.doctors
  ) {
    const plan = await generateBrollPlan({
      doctorName: detail.project.doctors.full_name,
      specialization: detail.project.doctors.specialization,
      brandName: context.brand.name,
    });
    await updateProject(context.supabase, projectId, {
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
    await replaceProjectScenes(context.supabase, projectId, plan.scenes);
  }

  if (
    detail.project.content_type === "organ_talk" &&
    detail.project.organ_avatars
  ) {
    const plan = await generateOrganPlan({
      organLabel: detail.project.organ_avatars.label,
      organDescription: detail.project.organ_avatars.description,
      brandName: context.brand.name,
    });
    await updateProject(context.supabase, projectId, {
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
    await replaceProjectScenes(context.supabase, projectId, plan.scenes);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  redirectWithMessage(`/dashboard/projects/${projectId}`, {
    message: "Storyboard дахин үүсгэгдлээ.",
  });
}

export async function queueSceneGenerationAction(formData: FormData) {
  try {
    const context = await requireBrandContext("/dashboard/projects");
    const projectId = getString(formData, "projectId");
    const sceneId = getString(formData, "sceneId");
    const detail = await getProjectDetail(context.supabase, projectId);
    const scene = detail.scenes.find((item) => item.id === sceneId);

    if (!scene) {
      redirectWithMessage(`/dashboard/projects/${projectId}`, {
        error: "Scene олдсонгүй.",
      });
    }

    await setProjectStatus(context.supabase, projectId, "queued");

    const job = await createGenerationJob(context.supabase, {
      projectId,
      createdBy: context.user.id,
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
      await updateGenerationJob(context.supabase, job.id, {
        status: "failed",
        error_message: "KIE_API_KEY тохируулаагүй байна.",
      });
      await setSceneRenderState(context.supabase, scene.id, {
        status: "failed",
        errorMessage: "KIE.ai түлхүүр тохируулаагүй тул scene render эхэлсэнгүй.",
      });
      revalidatePath(`/dashboard/projects/${projectId}`);
      redirectWithMessage(`/dashboard/projects/${projectId}`, {
        error: "KIE_API_KEY тохируулаагүй байна.",
      });
    }

    const prompt = [
      scene.title,
      scene.visual_prompt,
      scene.animation_prompt,
      scene.narration,
    ]
      .filter(Boolean)
      .join(". ");
    const callbackUrl = new URL("/api/kie/callback", "http://localhost");
    const callbackSecret = getKieCallbackSecret();

    callbackUrl.searchParams.set("projectId", projectId);
    callbackUrl.searchParams.set("sceneId", scene.id);
    if (callbackSecret) {
      callbackUrl.searchParams.set("token", callbackSecret);
    }
    const providerJobId = await requestRunwayVideoGeneration({
      prompt,
      durationSeconds: scene.duration_seconds >= 8 ? 10 : 5,
      callbackUrl:
        process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL
          ? new URL(
              callbackUrl.pathname + callbackUrl.search,
              process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL,
            ).toString()
          : undefined,
    });

    await updateGenerationJob(context.supabase, job.id, {
      status: "processing",
      provider_job_id: providerJobId,
    });
    await setSceneRenderState(context.supabase, scene.id, {
      status: "rendering",
      providerClipJobId: providerJobId,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    redirectWithMessage(`/dashboard/projects/${projectId}`, {
      message: "Scene render дараалалд орлоо.",
    });
  } catch (error) {
    const projectId = getString(formData, "projectId");
    redirectWithMessage(`/dashboard/projects/${projectId}`, {
      error: getErrorMessage(error, "Scene generate үед алдаа гарлаа."),
    });
  }
}

export async function mergeProjectAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  let mergeJobId: string | null = null;

  try {
    const context = await requireBrandContext("/dashboard/projects");
    const detail = await getProjectDetail(context.supabase, projectId);
    const readyClips = detail.scenes
      .filter((scene) => scene.clip_url)
      .map((scene) => scene.clip_url as string);

    if (readyClips.length === 0) {
      redirectWithMessage(`/dashboard/projects/${projectId}`, {
        error: "Merge хийхэд бэлэн клип алга байна.",
      });
    }

    const settings = await getBrandSettings(context.supabase, context.brand.id);
    const mergeJob = await createGenerationJob(context.supabase, {
      projectId,
      createdBy: context.user.id,
      provider: "system",
      jobType: "merge",
      status: "processing",
      requestPayload: {
        scenes: readyClips.length,
        applyFrame: detail.project.apply_frame,
        applyOutro: detail.project.apply_outro,
      },
    });
    mergeJobId = mergeJob.id;

    await setProjectStatus(context.supabase, projectId, "rendering");

    const merged = await mergeProjectVideo(context.supabase, {
      brandId: context.brand.id,
      projectId,
      clipSources: readyClips,
      audioSource:
        detail.project.content_type === "b_roll_head_explainer"
          ? detail.project.source_audio_path
          : null,
      frameSource: detail.project.apply_frame ? settings.brand.frame_path : null,
      outroSource: detail.project.apply_outro
        ? settings.brand.outro_video_path
        : null,
    });

    await updateGenerationJob(context.supabase, mergeJob.id, {
      status: "succeeded",
      response_payload: merged,
      finished_at: new Date().toISOString(),
    });
    await consumeProjectCredit(context.supabase, projectId, merged.finalPath);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);
    redirectWithMessage(`/dashboard/projects/${projectId}`, {
      message: "Final reel амжилттай бэлэн боллоо.",
    });
  } catch (error) {
    const message = getErrorMessage(error, "Merge шатанд алдаа гарлаа.");

    try {
      const context = await requireBrandContext("/dashboard/projects");

      if (mergeJobId) {
        await updateGenerationJob(context.supabase, mergeJobId, {
          status: "failed",
          error_message: message,
          finished_at: new Date().toISOString(),
        });
      }

      await setProjectStatus(context.supabase, projectId, "failed", message);
    } catch {
      // Ignore secondary persistence errors and still surface the original failure.
    }

    redirectWithMessage(`/dashboard/projects/${projectId}`, { error: message });
  }
}

export async function pollJobAction(formData: FormData) {
  try {
    const context = await requireBrandContext("/dashboard/projects");
    const projectId = getString(formData, "projectId");
    const jobId = getString(formData, "jobId");
    const { data: job, error } = await context.supabase
      .from("generation_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error || !job) {
      redirectWithMessage(`/dashboard/projects/${projectId}`, {
        error: "Job олдсонгүй.",
      });
    }

    if (!canUseKie() || job.provider !== "kie" || !job.provider_job_id) {
      redirectWithMessage(`/dashboard/projects/${projectId}`, {
        error: "Энэ job-д polling хийх боломжгүй байна.",
      });
    }

    const detail = await getRunwayTaskDetail(job.provider_job_id);
    const nextSceneStatus = mapKieStateToSceneStatus(detail.state);
    const nextJobStatus =
      detail.state === "success"
        ? "succeeded"
        : detail.state === "fail"
          ? "failed"
          : "processing";

    await updateGenerationJob(context.supabase, job.id, {
      status: nextJobStatus,
      response_payload: detail,
      error_message: detail.failMsg,
      finished_at:
        nextJobStatus === "succeeded" || nextJobStatus === "failed"
          ? new Date().toISOString()
          : null,
    });

    if (job.scene_id) {
      await setSceneRenderState(context.supabase, job.scene_id, {
        status: nextSceneStatus,
        providerClipJobId: detail.taskId,
        clipUrl: detail.videoUrl,
        previewUrl: detail.videoUrl,
        errorMessage: detail.failMsg,
      });
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    redirectWithMessage(`/dashboard/projects/${projectId}`, {
      message:
        detail.state === "success"
          ? "Scene render амжилттай дууслаа."
          : detail.state === "fail"
            ? detail.failMsg ?? "Scene render амжилтгүй боллоо."
            : "Job төлөв шинэчлэгдлээ.",
    });
  } catch (error) {
    const projectId = getString(formData, "projectId");
    redirectWithMessage(`/dashboard/projects/${projectId}`, {
      error: getErrorMessage(error, "Job polling үед алдаа гарлаа."),
    });
  }
}
