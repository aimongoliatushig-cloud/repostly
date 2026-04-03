import type { SupabaseClient } from "@supabase/supabase-js";

import { createSignedAssetUrl, uploadBrandFile } from "@/lib/storage/service";
import type {
  Database,
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/lib/supabase/database.types";

type SubscriptionWithPlan = TableRow<"brand_subscriptions"> & {
  subscription_plans: TableRow<"subscription_plans"> | null;
};

export type BrandSettingsView = {
  brand: TableRow<"brands">;
  logoUrl: string | null;
  frameUrl: string | null;
  outroUrl: string | null;
};

export async function getPlanCatalog(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("credits", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getActiveSubscription(
  supabase: SupabaseClient<Database>,
  brandId: string,
) {
  const { data, error } = await supabase
    .from("brand_subscriptions")
    .select("*")
    .eq("brand_id", brandId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const subscription =
    (data?.[0] as TableRow<"brand_subscriptions"> | undefined) ?? null;

  if (!subscription) {
    return null;
  }

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", subscription.plan_id)
    .maybeSingle();

  if (planError) {
    throw planError;
  }

  return {
    ...subscription,
    subscription_plans: (plan as TableRow<"subscription_plans"> | null) ?? null,
  } satisfies SubscriptionWithPlan;
}

export async function listCreditLedger(
  supabase: SupabaseClient<Database>,
  brandId: string,
  limit = 20,
) {
  const { data, error } = await supabase
    .from("credit_ledger")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getBrandSettings(
  supabase: SupabaseClient<Database>,
  brandId: string,
) {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .single();

  if (error) {
    throw error;
  }

  const [logoUrl, frameUrl, outroUrl] = await Promise.all([
    createSignedAssetUrl(supabase, data.logo_path),
    createSignedAssetUrl(supabase, data.frame_path),
    createSignedAssetUrl(supabase, data.outro_video_path),
  ]);

  return {
    brand: data as TableRow<"brands">,
    logoUrl,
    frameUrl,
    outroUrl,
  } satisfies BrandSettingsView;
}

async function upsertBrandAsset(
  supabase: SupabaseClient<Database>,
  asset: TableInsert<"brand_assets">,
) {
  const { error } = await supabase.from("brand_assets").insert(asset);

  if (error) {
    throw error;
  }
}

export async function saveBrandSettings(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    userId: string;
    name: string;
    phone?: string | null;
    website?: string | null;
    facebookUrl?: string | null;
    address?: string | null;
    logoFile?: File | null;
    frameFile?: File | null;
    outroFile?: File | null;
  },
) {
  const updates: TableUpdate<"brands"> = {
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    website: input.website?.trim() || null,
    facebook_url: input.facebookUrl?.trim() || null,
    address: input.address?.trim() || null,
  };

  if (input.logoFile && input.logoFile.size > 0) {
    const logoPath = await uploadBrandFile(
      supabase,
      input.brandId,
      "brand-logo",
      input.logoFile,
    );
    updates.logo_path = logoPath;
    await upsertBrandAsset(supabase, {
      brand_id: input.brandId,
      asset_type: "logo",
      storage_path: logoPath,
      mime_type: input.logoFile.type,
      created_by: input.userId,
    });
  }

  if (input.frameFile && input.frameFile.size > 0) {
    const framePath = await uploadBrandFile(
      supabase,
      input.brandId,
      "brand-frame",
      input.frameFile,
    );
    updates.frame_path = framePath;
    await upsertBrandAsset(supabase, {
      brand_id: input.brandId,
      asset_type: "frame",
      storage_path: framePath,
      mime_type: input.frameFile.type,
      created_by: input.userId,
    });
  }

  if (input.outroFile && input.outroFile.size > 0) {
    const outroPath = await uploadBrandFile(
      supabase,
      input.brandId,
      "brand-outro",
      input.outroFile,
    );
    updates.outro_video_path = outroPath;
    await upsertBrandAsset(supabase, {
      brand_id: input.brandId,
      asset_type: "outro",
      storage_path: outroPath,
      mime_type: input.outroFile.type,
      created_by: input.userId,
    });
  }

  const { error } = await supabase
    .from("brands")
    .update(updates)
    .eq("id", input.brandId);

  if (error) {
    throw error;
  }
}
