import type { SupabaseClient } from "@supabase/supabase-js";

import { createSignedAssetUrl, uploadBrandFile } from "@/lib/storage/service";
import type {
  Database,
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/lib/supabase/database.types";
import { isMissingRelationError } from "@/lib/supabase/errors";
import type { BrandSettingsView as HospitalBrandSettingsView } from "@/types/hospital";

type SubscriptionWithPlan = TableRow<"brand_subscriptions"> & {
  subscription_plans: TableRow<"subscription_plans"> | null;
};

export type BrandSettingsView = HospitalBrandSettingsView & {
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

function buildFallbackBrandSettings(brand: TableRow<"brands">) {
  return {
    id: brand.id,
    hospital_name: brand.name,
    logo_url: brand.logo_path,
    frame_url: brand.frame_path,
    outro_url: brand.outro_video_path,
    phone: brand.phone,
    website: brand.website,
    facebook: brand.facebook_url,
    address_mn: brand.address,
    created_at: brand.created_at,
    updated_at: brand.updated_at,
  } as TableRow<"brand_settings">;
}

async function ensureBrandSettingsRow(
  supabase: SupabaseClient<Database>,
  brand: TableRow<"brands">,
) {
  const { data, error } = await supabase
    .from("brand_settings")
    .select("*")
    .eq("id", brand.id)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error, "brand_settings")) {
      return buildFallbackBrandSettings(brand);
    }

    throw error;
  }

  if (data) {
    return data;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("brand_settings")
    .insert({
      id: brand.id,
      hospital_name: brand.name,
      logo_url: brand.logo_path,
      frame_url: brand.frame_path,
      outro_url: brand.outro_video_path,
      phone: brand.phone,
      website: brand.website,
      facebook: brand.facebook_url,
      address_mn: brand.address,
    })
    .select("*")
    .single();

  if (insertError) {
    if (isMissingRelationError(insertError, "brand_settings")) {
      return buildFallbackBrandSettings(brand);
    }

    throw insertError;
  }

  return inserted;
}

export async function getBrandSettings(
  supabase: SupabaseClient<Database>,
  brandId: string,
  options?: {
    includeSignedUrls?: boolean;
  },
) {
  const { data: brand, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .single();

  if (error) {
    throw error;
  }

  const settings = await ensureBrandSettingsRow(supabase, brand);
  const shouldIncludeSignedUrls = options?.includeSignedUrls ?? true;
  const [logoSignedUrl, frameSignedUrl, outroSignedUrl] = shouldIncludeSignedUrls
    ? await Promise.all([
        createSignedAssetUrl(
          supabase,
          settings.logo_url ?? brand.logo_path ?? null,
        ),
        createSignedAssetUrl(
          supabase,
          settings.frame_url ?? brand.frame_path ?? null,
        ),
        createSignedAssetUrl(
          supabase,
          settings.outro_url ?? brand.outro_video_path ?? null,
        ),
      ])
    : [null, null, null];

  return {
    brand,
    settings,
    logoSignedUrl,
    frameSignedUrl,
    outroSignedUrl,
    logoUrl: logoSignedUrl,
    frameUrl: frameSignedUrl,
    outroUrl: outroSignedUrl,
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
    hospitalName?: string;
    name?: string;
    phone?: string | null;
    website?: string | null;
    facebook?: string | null;
    facebookUrl?: string | null;
    addressMn?: string | null;
    address?: string | null;
    logoFile?: File | null;
    frameFile?: File | null;
    outroFile?: File | null;
  },
) {
  const hospitalName = (input.hospitalName ?? input.name ?? "").trim();

  if (!hospitalName) {
    throw new Error("Эмнэлгийн нэр хоосон байж болохгүй.");
  }

  const facebook = input.facebook?.trim() || input.facebookUrl?.trim() || null;
  const addressMn = input.addressMn?.trim() || input.address?.trim() || null;

  const brandUpdates: TableUpdate<"brands"> = {
    name: hospitalName,
    phone: input.phone?.trim() || null,
    website: input.website?.trim() || null,
    facebook_url: facebook,
    address: addressMn,
  };

  const brandSettingsUpdates: TableInsert<"brand_settings"> = {
    id: input.brandId,
    hospital_name: hospitalName,
    phone: input.phone?.trim() || null,
    website: input.website?.trim() || null,
    facebook,
    address_mn: addressMn,
  };

  if (input.logoFile && input.logoFile.size > 0) {
    const logoPath = await uploadBrandFile(
      supabase,
      input.brandId,
      "brand-logo",
      input.logoFile,
    );
    brandUpdates.logo_path = logoPath;
    brandSettingsUpdates.logo_url = logoPath;
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
    brandUpdates.frame_path = framePath;
    brandSettingsUpdates.frame_url = framePath;
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
    brandUpdates.outro_video_path = outroPath;
    brandSettingsUpdates.outro_url = outroPath;
    await upsertBrandAsset(supabase, {
      brand_id: input.brandId,
      asset_type: "outro",
      storage_path: outroPath,
      mime_type: input.outroFile.type,
      created_by: input.userId,
    });
  }

  const { error: brandError } = await supabase
    .from("brands")
    .update(brandUpdates)
    .eq("id", input.brandId);

  if (brandError) {
    throw brandError;
  }

  const { error: settingsError } = await supabase
    .from("brand_settings")
    .upsert(brandSettingsUpdates);

  if (settingsError) {
    if (isMissingRelationError(settingsError, "brand_settings")) {
      return;
    }

    throw settingsError;
  }
}
