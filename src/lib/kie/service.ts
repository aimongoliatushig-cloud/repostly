import { getKieApiBaseUrl, getKieApiKey, hasKieEnv } from "@/lib/env";

export type KieVideoRequest = {
  prompt: string;
  durationSeconds: 5 | 10;
  imageUrl?: string | null;
  callbackUrl?: string;
  quality?: "720p" | "1080p";
};

export type KieTaskDetail = {
  taskId: string;
  state: "wait" | "queueing" | "generating" | "success" | "fail";
  videoUrl: string | null;
  imageUrl: string | null;
  failCode: number | null;
  failMsg: string | null;
};

type KieEnvelope<T> = {
  code: number;
  msg: string;
  data: T;
};

function getHeaders() {
  const apiKey = getKieApiKey();

  if (!apiKey) {
    throw new Error("KIE API түлхүүр тохируулаагүй байна.");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export function canUseKie() {
  return hasKieEnv();
}

export async function requestRunwayVideoGeneration(input: KieVideoRequest) {
  const response = await fetch(`${getKieApiBaseUrl()}/api/v1/runway/generate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      prompt: input.prompt,
      imageUrl: input.imageUrl || undefined,
      duration: input.durationSeconds,
      quality:
        input.quality ||
        (input.durationSeconds === 10 ? "720p" : "1080p"),
      model:
        input.durationSeconds === 10
          ? "runway-duration-10-generate"
          : "runway-duration-5-generate",
      aspectRatio: "9:16",
      waterMark: "Postly AI",
      expandPrompt: true,
      callBackUrl: input.callbackUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`KIE generation алдаа: ${response.status}`);
  }

  const payload = (await response.json()) as KieEnvelope<{
    taskId: string;
  }>;

  if (payload.code !== 200 || !payload.data?.taskId) {
    throw new Error(payload.msg || "KIE generation амжилтгүй боллоо.");
  }

  return payload.data.taskId;
}

export async function getRunwayTaskDetail(taskId: string) {
  const url = new URL(`${getKieApiBaseUrl()}/api/v1/runway/record-detail`);
  url.searchParams.set("taskId", taskId);

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KIE status алдаа: ${response.status}`);
  }

  const payload = (await response.json()) as KieEnvelope<{
    taskId: string;
    state: KieTaskDetail["state"];
    videoInfo?: {
      videoUrl?: string | null;
      imageUrl?: string | null;
    };
    failCode?: number | null;
    failMsg?: string | null;
  }>;

  if (payload.code !== 200 || !payload.data?.taskId) {
    throw new Error(payload.msg || "KIE status мэдээлэл ирсэнгүй.");
  }

  return {
    taskId: payload.data.taskId,
    state: payload.data.state,
    videoUrl: payload.data.videoInfo?.videoUrl ?? null,
    imageUrl: payload.data.videoInfo?.imageUrl ?? null,
    failCode: payload.data.failCode ?? null,
    failMsg: payload.data.failMsg ?? null,
  } satisfies KieTaskDetail;
}

export function mapKieStateToSceneStatus(
  state: KieTaskDetail["state"],
): "queued" | "rendering" | "ready" | "failed" {
  switch (state) {
    case "wait":
    case "queueing":
      return "queued";
    case "generating":
      return "rendering";
    case "success":
      return "ready";
    case "fail":
      return "failed";
    default:
      return "queued";
  }
}
