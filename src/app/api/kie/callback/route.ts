import { NextResponse } from "next/server";

import { getKieCallbackSecret } from "@/lib/env";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const sceneId = url.searchParams.get("sceneId");
  const token = url.searchParams.get("token");
  const expectedToken = getKieCallbackSecret();

  if (expectedToken && token !== expectedToken) {
    return NextResponse.json({ error: "Invalid callback token." }, { status: 401 });
  }

  if (!projectId || !sceneId) {
    return NextResponse.json(
      { error: "projectId болон sceneId шаардлагатай." },
      { status: 400 },
    );
  }

  const payload = (await request.json().catch(() => ({}))) as {
    taskId?: string;
    state?: string;
    videoUrl?: string;
    failMsg?: string;
    data?: {
      taskId?: string;
      state?: string;
      failMsg?: string;
      videoInfo?: {
        videoUrl?: string;
      };
    };
  };

  const taskId = payload.data?.taskId ?? payload.taskId;
  const state = payload.data?.state ?? payload.state;
  const videoUrl = payload.data?.videoInfo?.videoUrl ?? payload.videoUrl ?? null;
  const failMessage = payload.data?.failMsg ?? payload.failMsg ?? null;

  if (!taskId || !state) {
    return NextResponse.json(
      { error: "taskId болон state callback payload-д алга байна." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("apply_kie_scene_callback", {
    target_project_id: projectId,
    target_scene_id: sceneId,
    target_provider_job_id: taskId,
    job_state: state,
    video_url: videoUrl,
    fail_message: failMessage,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ accepted: true });
}
