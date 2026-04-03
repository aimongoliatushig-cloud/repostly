import type { SupabaseClient } from "@supabase/supabase-js";

import { createSignedAssetUrl, uploadBrandFile } from "@/lib/storage/service";
import type {
  Database,
  Json,
  JobStatus,
  JobType,
  ProjectStatus,
  SceneStatus,
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/lib/supabase/database.types";

type ProjectQueryRow = TableRow<"video_projects"> & {
  doctors:
    | Pick<TableRow<"doctors">, "id" | "full_name" | "specialization">
    | null;
  organ_avatars:
    | Pick<TableRow<"organ_avatars">, "id" | "label" | "slug" | "description">
    | null;
};

export type SceneView = TableRow<"project_scenes"> & {
  previewAssetUrl: string | null;
  clipAssetUrl: string | null;
};

export type ProjectListItem = ProjectQueryRow & {
  doctorName: string | null;
  doctorSpecialization: string | null;
  organLabel: string | null;
};

export type ProjectDetail = {
  project: ProjectListItem;
  scenes: SceneView[];
  jobs: TableRow<"generation_jobs">[];
  finalVideoAssetUrl: string | null;
  sourceAudioUrl: string | null;
};

export type ScenePlanInput = {
  title: string;
  narration: string;
  visualPrompt: string;
  animationPrompt: string;
  durationSeconds: number;
};

export async function listProjects(
  supabase: SupabaseClient<Database>,
  brandId: string,
) {
  const { data, error } = await supabase
    .from("video_projects")
    .select("*")
    .eq("brand_id", brandId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const projects = (data ?? []) as TableRow<"video_projects">[];
  const doctorIds = Array.from(
    new Set(projects.map((project) => project.doctor_id).filter(Boolean)),
  ) as string[];
  const organIds = Array.from(
    new Set(projects.map((project) => project.organ_avatar_id).filter(Boolean)),
  ) as string[];

  const [doctorRows, organRows] = await Promise.all([
    doctorIds.length > 0
      ? supabase
          .from("doctors")
          .select("id, full_name, specialization")
          .in("id", doctorIds)
      : Promise.resolve({ data: [], error: null }),
    organIds.length > 0
      ? supabase
          .from("organ_avatars")
          .select("id, label, slug, description")
          .in("id", organIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (doctorRows.error) {
    throw doctorRows.error;
  }

  if (organRows.error) {
    throw organRows.error;
  }

  const doctorsById = new Map(
    ((doctorRows.data ?? []) as Array<
      Pick<TableRow<"doctors">, "id" | "full_name" | "specialization">
    >).map((doctor) => [doctor.id, doctor]),
  );
  const organsById = new Map(
    ((organRows.data ?? []) as Array<
      Pick<TableRow<"organ_avatars">, "id" | "label" | "slug" | "description">
    >).map((organ) => [organ.id, organ]),
  );

  return projects.map((project) => {
    const doctor = project.doctor_id ? doctorsById.get(project.doctor_id) ?? null : null;
    const organ = project.organ_avatar_id
      ? organsById.get(project.organ_avatar_id) ?? null
      : null;

    return {
      ...(project as TableRow<"video_projects">),
      doctors: doctor,
      organ_avatars: organ,
      doctorName: doctor?.full_name ?? null,
      doctorSpecialization: doctor?.specialization ?? null,
      organLabel: organ?.label ?? null,
    };
  }) satisfies ProjectListItem[];
}

export async function getProjectDetail(
  supabase: SupabaseClient<Database>,
  projectId: string,
) {
  const { data: projectData, error: projectError } = await supabase
    .from("video_projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError) {
    throw projectError;
  }

  const projectRow = projectData as TableRow<"video_projects">;
  const [doctorResponse, organResponse, scenesResponse, jobsResponse, finalVideoAssetUrl, sourceAudioUrl] =
    await Promise.all([
      projectRow.doctor_id
        ? supabase
            .from("doctors")
            .select("id, full_name, specialization")
            .eq("id", projectRow.doctor_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      projectRow.organ_avatar_id
        ? supabase
            .from("organ_avatars")
            .select("id, label, slug, description")
            .eq("id", projectRow.organ_avatar_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("project_scenes")
        .select("*")
        .eq("project_id", projectId)
        .order("scene_index", { ascending: true }),
      supabase
        .from("generation_jobs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      createSignedAssetUrl(supabase, projectRow.final_video_url, 60 * 60 * 24),
      createSignedAssetUrl(supabase, projectRow.source_audio_path),
    ]);

  if (doctorResponse.error) {
    throw doctorResponse.error;
  }

  if (organResponse.error) {
    throw organResponse.error;
  }

  if (scenesResponse.error) {
    throw scenesResponse.error;
  }

  if (jobsResponse.error) {
    throw jobsResponse.error;
  }

  const scenes = scenesResponse.data ?? [];
  const previewUrls = await Promise.all(
    scenes.map((scene) =>
      createSignedAssetUrl(supabase, scene.preview_url ?? scene.clip_url),
    ),
  );
  const clipUrls = await Promise.all(
    scenes.map((scene) => createSignedAssetUrl(supabase, scene.clip_url)),
  );

  const project = {
    ...projectRow,
    doctors:
      (doctorResponse.data as
        | Pick<TableRow<"doctors">, "id" | "full_name" | "specialization">
        | null) ?? null,
    organ_avatars:
      (organResponse.data as
        | Pick<TableRow<"organ_avatars">, "id" | "label" | "slug" | "description">
        | null) ?? null,
    doctorName:
      ((doctorResponse.data as Pick<
        TableRow<"doctors">,
        "id" | "full_name" | "specialization"
      > | null) ?? null)?.full_name ?? null,
    doctorSpecialization:
      ((doctorResponse.data as Pick<
        TableRow<"doctors">,
        "id" | "full_name" | "specialization"
      > | null) ?? null)?.specialization ?? null,
    organLabel:
      ((organResponse.data as Pick<
        TableRow<"organ_avatars">,
        "id" | "label" | "slug" | "description"
      > | null) ?? null)?.label ?? null,
  } satisfies ProjectListItem;

  return {
    project,
    scenes: scenes.map((scene, index) => ({
      ...scene,
      previewAssetUrl: previewUrls[index],
      clipAssetUrl: clipUrls[index],
    })) satisfies SceneView[],
    jobs: jobsResponse.data ?? [],
    finalVideoAssetUrl,
    sourceAudioUrl,
  } satisfies ProjectDetail;
}

export async function createProjectDraft(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    userId: string;
    title: string;
    contentType: TableRow<"video_projects">["content_type"];
    doctorId?: string | null;
    organAvatarId?: string | null;
    durationLimitSeconds: number;
    applyFrame?: boolean;
    applyOutro?: boolean;
    sourceAudioFile?: File | null;
    metadata?: Json;
  },
) {
  const insertData: TableInsert<"video_projects"> = {
    brand_id: input.brandId,
    created_by: input.userId,
    title: input.title.trim(),
    content_type: input.contentType,
    doctor_id: input.doctorId ?? null,
    organ_avatar_id: input.organAvatarId ?? null,
    duration_limit_seconds: input.durationLimitSeconds,
    apply_frame: Boolean(input.applyFrame),
    apply_outro: Boolean(input.applyOutro),
    status: "draft",
    metadata: input.metadata ?? {},
  };

  if (input.sourceAudioFile && input.sourceAudioFile.size > 0) {
    insertData.source_audio_path = await uploadBrandFile(
      supabase,
      input.brandId,
      "project-audio",
      input.sourceAudioFile,
    );
  }

  const { data, error } = await supabase
    .from("video_projects")
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as TableRow<"video_projects">;
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  updates: TableUpdate<"video_projects">,
) {
  const { error } = await supabase
    .from("video_projects")
    .update(updates)
    .eq("id", projectId);

  if (error) {
    throw error;
  }
}

export async function replaceProjectScenes(
  supabase: SupabaseClient<Database>,
  projectId: string,
  scenes: ScenePlanInput[],
) {
  const { error: deleteError } = await supabase
    .from("project_scenes")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    throw deleteError;
  }

  if (scenes.length === 0) {
    return;
  }

  const inserts: TableInsert<"project_scenes">[] = scenes.map((scene, index) => ({
    project_id: projectId,
    scene_index: index + 1,
    title: scene.title.trim(),
    narration: scene.narration.trim(),
    visual_prompt: scene.visualPrompt.trim(),
    animation_prompt: scene.animationPrompt.trim(),
    duration_seconds: scene.durationSeconds,
    status: "editable",
    metadata: {},
  }));

  const { error: insertError } = await supabase
    .from("project_scenes")
    .insert(inserts);

  if (insertError) {
    throw insertError;
  }
}

export async function updateScene(
  supabase: SupabaseClient<Database>,
  sceneId: string,
  updates: TableUpdate<"project_scenes">,
) {
  const { error } = await supabase
    .from("project_scenes")
    .update(updates)
    .eq("id", sceneId);

  if (error) {
    throw error;
  }
}

export async function createGenerationJob(
  supabase: SupabaseClient<Database>,
  input: {
    projectId: string;
    createdBy: string;
    sceneId?: string | null;
    provider: "openai" | "kie" | "system";
    jobType: JobType;
    status?: JobStatus;
    providerJobId?: string | null;
    requestPayload?: Json;
    responsePayload?: Json;
    errorMessage?: string | null;
  },
) {
  const insertData: TableInsert<"generation_jobs"> = {
    project_id: input.projectId,
    scene_id: input.sceneId ?? null,
    provider: input.provider,
    job_type: input.jobType,
    status: input.status ?? "queued",
    provider_job_id: input.providerJobId ?? null,
    request_payload: input.requestPayload ?? {},
    response_payload: input.responsePayload ?? {},
    error_message: input.errorMessage ?? null,
    created_by: input.createdBy,
  };
  const { data, error } = await supabase
    .from("generation_jobs")
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as TableRow<"generation_jobs">;
}

export async function updateGenerationJob(
  supabase: SupabaseClient<Database>,
  jobId: string,
  updates: TableUpdate<"generation_jobs">,
) {
  const { error } = await supabase
    .from("generation_jobs")
    .update(updates)
    .eq("id", jobId);

  if (error) {
    throw error;
  }
}

export async function setSceneRenderState(
  supabase: SupabaseClient<Database>,
  sceneId: string,
  input: {
    status: SceneStatus;
    providerClipJobId?: string | null;
    clipUrl?: string | null;
    previewUrl?: string | null;
    errorMessage?: string | null;
    seedId?: string | null;
  },
) {
  const updates: TableUpdate<"project_scenes"> = {
    status: input.status,
    provider_clip_job_id: input.providerClipJobId ?? null,
    clip_url: input.clipUrl ?? null,
    preview_url: input.previewUrl ?? null,
    error_message: input.errorMessage ?? null,
    seed_id: input.seedId ?? null,
    last_generated_at:
      input.status === "ready" || input.status === "rendering"
        ? new Date().toISOString()
        : undefined,
  };

  await updateScene(supabase, sceneId, updates);
}

export async function setProjectStatus(
  supabase: SupabaseClient<Database>,
  projectId: string,
  status: ProjectStatus,
  errorMessage?: string | null,
) {
  await updateProject(supabase, projectId, {
    status,
    error_message: errorMessage ?? null,
  });
}

export async function consumeProjectCredit(
  supabase: SupabaseClient<Database>,
  projectId: string,
  finalUrl: string,
) {
  const { error } = await supabase.rpc("consume_video_credit", {
    target_project_id: projectId,
    final_url: finalUrl,
  });

  if (error) {
    throw error;
  }
}
