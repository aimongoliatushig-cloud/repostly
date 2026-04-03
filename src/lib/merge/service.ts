import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createSignedAssetUrl,
  uploadStorageObject,
} from "@/lib/storage/service";
import type { Database } from "@/lib/supabase/database.types";

async function runFfmpeg(args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("ffmpeg", args, {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `ffmpeg exited with code ${code}`));
    });
  });
}

async function downloadToFile(url: string, outputPath: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Файл татахад алдаа гарлаа: ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, bytes);
}

async function resolveRemoteUrl(
  supabase: SupabaseClient<Database>,
  pathOrUrl: string,
) {
  const resolved = await createSignedAssetUrl(supabase, pathOrUrl, 60 * 60);

  if (!resolved) {
    throw new Error("Файлын URL үүсгэж чадсангүй.");
  }

  return resolved;
}

export async function mergeProjectVideo(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    projectId: string;
    clipSources: string[];
    audioSource?: string | null;
    frameSource?: string | null;
    outroSource?: string | null;
  },
) {
  if (input.clipSources.length === 0) {
    throw new Error("Merge хийх клип алга байна.");
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "postly-merge-"));

  try {
    const clipFiles = await Promise.all(
      input.clipSources.map(async (clipSource, index) => {
        const url = await resolveRemoteUrl(supabase, clipSource);
        const outputPath = path.join(tempDir, `scene-${index + 1}.mp4`);
        await downloadToFile(url, outputPath);
        return outputPath;
      }),
    );

    const concatListPath = path.join(tempDir, "clips.txt");
    await writeFile(
      concatListPath,
      clipFiles.map((file) => `file '${file.replace(/'/g, "'\\''")}'`).join("\n"),
      "utf8",
    );

    let currentVideoPath = path.join(tempDir, "concat.mp4");
    await runFfmpeg([
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListPath,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      currentVideoPath,
    ]);

    if (input.frameSource) {
      const framePath = path.join(tempDir, "frame.png");
      await downloadToFile(
        await resolveRemoteUrl(supabase, input.frameSource),
        framePath,
      );

      const framedPath = path.join(tempDir, "framed.mp4");
      await runFfmpeg([
        "-y",
        "-i",
        currentVideoPath,
        "-i",
        framePath,
        "-filter_complex",
        "overlay=0:0",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "copy",
        framedPath,
      ]);
      currentVideoPath = framedPath;
    }

    if (input.audioSource) {
      const audioPath = path.join(tempDir, "voice.mp3");
      await downloadToFile(
        await resolveRemoteUrl(supabase, input.audioSource),
        audioPath,
      );

      const voicedPath = path.join(tempDir, "with-audio.mp4");
      await runFfmpeg([
        "-y",
        "-i",
        currentVideoPath,
        "-i",
        audioPath,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-shortest",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        voicedPath,
      ]);
      currentVideoPath = voicedPath;
    }

    if (input.outroSource) {
      const outroPath = path.join(tempDir, "outro.mp4");
      await downloadToFile(
        await resolveRemoteUrl(supabase, input.outroSource),
        outroPath,
      );

      const outroListPath = path.join(tempDir, "final-list.txt");
      await writeFile(
        outroListPath,
        [
          `file '${currentVideoPath.replace(/'/g, "'\\''")}'`,
          `file '${outroPath.replace(/'/g, "'\\''")}'`,
        ].join("\n"),
        "utf8",
      );

      const withOutroPath = path.join(tempDir, "with-outro.mp4");
      await runFfmpeg([
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        outroListPath,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        withOutroPath,
      ]);
      currentVideoPath = withOutroPath;
    }

    const finalBytes = await readFile(currentVideoPath);
    const finalPath = await uploadStorageObject(
      supabase,
      input.brandId,
      "final-output",
      `${input.projectId}.mp4`,
      finalBytes,
      "video/mp4",
    );
    const finalUrl = await createSignedAssetUrl(supabase, finalPath, 60 * 60 * 24);

    return {
      finalPath,
      finalUrl,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
