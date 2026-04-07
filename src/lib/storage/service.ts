import { randomUUID } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export const STORAGE_BUCKET = "postly-private";

type UploadKind =
  | "doctor-image"
  | "avatar-image"
  | "brand-logo"
  | "brand-frame"
  | "brand-outro"
  | "project-audio"
  | "final-output";

const uploadRules: Record<
  UploadKind,
  {
    maxBytes: number;
    mimeTypes: string[];
    folder: string;
  }
> = {
  "doctor-image": {
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    folder: "doctors/portrait",
  },
  "avatar-image": {
    maxBytes: 8 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    folder: "doctors/avatar",
  },
  "brand-logo": {
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    folder: "brand/logo",
  },
  "brand-frame": {
    maxBytes: 8 * 1024 * 1024,
    mimeTypes: ["image/png", "image/webp"],
    folder: "brand/frame",
  },
  "brand-outro": {
    maxBytes: 150 * 1024 * 1024,
    mimeTypes: ["video/mp4", "video/quicktime"],
    folder: "brand/outro",
  },
  "project-audio": {
    maxBytes: 25 * 1024 * 1024,
    mimeTypes: ["audio/mpeg"],
    folder: "projects/audio",
  },
  "final-output": {
    maxBytes: 250 * 1024 * 1024,
    mimeTypes: ["video/mp4"],
    folder: "projects/final",
  },
};

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "");
}

export function validateUpload(kind: UploadKind, file: File) {
  const rule = uploadRules[kind];

  if (!rule.mimeTypes.includes(file.type)) {
    throw new Error("Файлын төрөл зөвшөөрөгдөхгүй байна.");
  }

  if (file.size > rule.maxBytes) {
    throw new Error("Файлын хэмжээ хэтэрсэн байна.");
  }
}

export function buildStoragePath(
  brandId: string,
  kind: UploadKind,
  filename: string,
) {
  const safeName = sanitizeFilename(filename || "asset");
  const token = randomUUID().slice(0, 8);
  const folder = uploadRules[kind].folder;

  return `brands/${brandId}/${folder}/${Date.now()}-${token}-${safeName}`;
}

export async function uploadBrandFile(
  supabase: SupabaseClient<Database>,
  brandId: string,
  kind: UploadKind,
  file: File,
) {
  validateUpload(kind, file);

  const storagePath = buildStoragePath(brandId, kind, file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data.path;
}

export async function uploadStorageObject(
  supabase: SupabaseClient<Database>,
  brandId: string,
  kind: UploadKind,
  filename: string,
  data: Buffer,
  contentType: string,
) {
  const storagePath = buildStoragePath(brandId, kind, filename);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, data, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return storagePath;
}

export async function createSignedAssetUrl(
  supabase: SupabaseClient<Database>,
  pathOrUrl: string | null | undefined,
  expiresIn = 60 * 60,
) {
  if (!pathOrUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(pathOrUrl, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function createSignedAssetUrls(
  supabase: SupabaseClient<Database>,
  pathsOrUrls: Array<string | null | undefined>,
  expiresIn = 60 * 60,
) {
  if (pathsOrUrls.length === 0) {
    return [] as Array<string | null>;
  }

  const directValues = new Map<number, string | null>();
  const storageItems: Array<{ index: number; path: string }> = [];

  pathsOrUrls.forEach((value, index) => {
    if (!value) {
      directValues.set(index, null);
      return;
    }

    if (/^https?:\/\//i.test(value)) {
      directValues.set(index, value);
      return;
    }

    storageItems.push({ index, path: value });
  });

  const signedResults = new Map<number, string | null>();

  if (storageItems.length > 0) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(
        storageItems.map((item) => item.path),
        expiresIn,
      );

    if (error) {
      throw error;
    }

    data.forEach((item, index) => {
      signedResults.set(storageItems[index].index, item.signedUrl);
    });
  }

  return pathsOrUrls.map((_, index) => {
    if (directValues.has(index)) {
      return directValues.get(index) ?? null;
    }

    return signedResults.get(index) ?? null;
  });
}
