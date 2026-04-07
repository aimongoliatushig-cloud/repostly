import type { SupabaseClient } from "@supabase/supabase-js";

import { createSignedAssetUrl, uploadBrandFile } from "@/lib/storage/service";
import type {
  Database,
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/lib/supabase/database.types";
import type {
  AvatarView,
  DoctorDetailView,
  DoctorListItem,
} from "@/types/hospital";

export type DoctorView = DoctorListItem;

function getDoctorName(input: {
  nameMn?: string;
  fullName?: string;
}) {
  return (input.nameMn ?? input.fullName ?? "").trim();
}

function getDoctorSpecialty(input: {
  specialtyMn?: string;
  specialization?: string;
}) {
  return (input.specialtyMn ?? input.specialization ?? "").trim();
}

async function signAvatarRows(
  supabase: SupabaseClient<Database>,
  avatars: TableRow<"avatars">[],
) {
  const signedUrls = await Promise.all(
    avatars.map((avatar) => createSignedAssetUrl(supabase, avatar.image_url)),
  );

  return avatars.map((avatar, index) => ({
    ...avatar,
    imageSignedUrl: signedUrls[index],
  })) satisfies AvatarView[];
}

async function getDoctorAvatarsByDoctorIds(
  supabase: SupabaseClient<Database>,
  doctorIds: string[],
) {
  if (doctorIds.length === 0) {
    return new Map<string, AvatarView[]>();
  }

  const { data, error } = await supabase
    .from("avatars")
    .select("*")
    .in("doctor_id", doctorIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const avatarViews = await signAvatarRows(supabase, data ?? []);
  const grouped = new Map<string, AvatarView[]>();

  avatarViews.forEach((avatar) => {
    const current = grouped.get(avatar.doctor_id) ?? [];
    current.push(avatar);
    grouped.set(avatar.doctor_id, current);
  });

  return grouped;
}

async function mapDoctorListItems(
  supabase: SupabaseClient<Database>,
  doctors: TableRow<"doctors">[],
) {
  const [avatarMap, portraitUrls] = await Promise.all([
    getDoctorAvatarsByDoctorIds(
      supabase,
      doctors.map((doctor) => doctor.id),
    ),
    Promise.all(
      doctors.map((doctor) =>
        createSignedAssetUrl(
          supabase,
          doctor.portrait_url ?? doctor.image_path ?? null,
        ),
      ),
    ),
  ]);

  return doctors.map((doctor, index) => {
    const avatars = avatarMap.get(doctor.id) ?? [];
    const primaryAvatar = avatars.find((avatar) => avatar.is_primary) ?? null;

    return {
      ...doctor,
      portraitSignedUrl: portraitUrls[index],
      avatarCount: avatars.length,
      primaryAvatar,
    };
  }) satisfies DoctorListItem[];
}

export async function listDoctors(
  supabase: SupabaseClient<Database>,
  brandId: string,
  options?: {
    includeInactive?: boolean;
  },
) {
  let query = supabase
    .from("doctors")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return mapDoctorListItems(supabase, data ?? []);
}

export async function getDoctorDetail(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    doctorId: string;
  },
) {
  const { data: doctor, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("brand_id", input.brandId)
    .eq("id", input.doctorId)
    .single();

  if (error) {
    throw error;
  }

  const { data: avatarRows, error: avatarError } = await supabase
    .from("avatars")
    .select("*")
    .eq("doctor_id", input.doctorId)
    .order("created_at", { ascending: false });

  if (avatarError) {
    throw avatarError;
  }

  const [portraitSignedUrl, avatars] = await Promise.all([
    createSignedAssetUrl(
      supabase,
      doctor.portrait_url ?? doctor.image_path ?? null,
    ),
    signAvatarRows(supabase, avatarRows ?? []),
  ]);

  return {
    doctor,
    portraitSignedUrl,
    avatars,
    primaryAvatar: avatars.find((avatar) => avatar.is_primary) ?? null,
  } satisfies DoctorDetailView;
}

export async function createDoctor(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    userId: string;
    nameMn?: string;
    specialtyMn?: string;
    portraitFile?: File | null;
    fullName?: string;
    specialization?: string;
    imageFile?: File | null;
  },
) {
  const nameMn = getDoctorName(input);
  const specialtyMn = getDoctorSpecialty(input);

  if (!nameMn || !specialtyMn) {
    throw new Error("Эмчийн нэр, мэргэжлийг бүрэн оруулна уу.");
  }

  const doctorInsert: TableInsert<"doctors"> = {
    brand_id: input.brandId,
    name_mn: nameMn,
    specialty_mn: specialtyMn,
    full_name: nameMn,
    specialization: specialtyMn,
    created_by: input.userId,
    is_active: true,
  };

  const portraitFile = input.portraitFile ?? input.imageFile;

  if (portraitFile && portraitFile.size > 0) {
    const portraitPath = await uploadBrandFile(
      supabase,
      input.brandId,
      "doctor-image",
      portraitFile,
    );
    doctorInsert.portrait_url = portraitPath;
    doctorInsert.image_path = portraitPath;
  }

  const { data, error } = await supabase
    .from("doctors")
    .insert(doctorInsert)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateDoctor(
  supabase: SupabaseClient<Database>,
  input: {
    doctorId: string;
    brandId: string;
    nameMn?: string;
    specialtyMn?: string;
    portraitFile?: File | null;
    fullName?: string;
    specialization?: string;
    imageFile?: File | null;
  },
) {
  const nameMn = getDoctorName(input);
  const specialtyMn = getDoctorSpecialty(input);

  if (!nameMn || !specialtyMn) {
    throw new Error("Эмчийн нэр, мэргэжлийг бүрэн оруулна уу.");
  }

  const updates: TableUpdate<"doctors"> = {
    name_mn: nameMn,
    specialty_mn: specialtyMn,
    full_name: nameMn,
    specialization: specialtyMn,
  };

  const portraitFile = input.portraitFile ?? input.imageFile;

  if (portraitFile && portraitFile.size > 0) {
    const portraitPath = await uploadBrandFile(
      supabase,
      input.brandId,
      "doctor-image",
      portraitFile,
    );
    updates.portrait_url = portraitPath;
    updates.image_path = portraitPath;
  }

  const { error } = await supabase
    .from("doctors")
    .update(updates)
    .eq("id", input.doctorId)
    .eq("brand_id", input.brandId);

  if (error) {
    throw error;
  }
}

export async function deleteDoctor(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    doctorId: string;
  },
) {
  const { error } = await supabase
    .from("doctors")
    .delete()
    .eq("id", input.doctorId)
    .eq("brand_id", input.brandId);

  if (error) {
    throw error;
  }
}

export async function archiveDoctor(
  supabase: SupabaseClient<Database>,
  doctorId: string,
) {
  const { error } = await supabase
    .from("doctors")
    .update({ is_active: false })
    .eq("id", doctorId);

  if (error) {
    throw error;
  }
}

async function getDoctorForAvatarWrite(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    doctorId: string;
  },
) {
  const { data, error } = await supabase
    .from("doctors")
    .select("id, brand_id")
    .eq("id", input.doctorId)
    .eq("brand_id", input.brandId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function addDoctorAvatar(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    doctorId: string;
    imageFile: File;
    isPrimary?: boolean;
  },
) {
  await getDoctorForAvatarWrite(supabase, input);

  const imagePath = await uploadBrandFile(
    supabase,
    input.brandId,
    "avatar-image",
    input.imageFile,
  );

  const { count, error: countError } = await supabase
    .from("avatars")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", input.doctorId);

  if (countError) {
    throw countError;
  }

  const { data, error } = await supabase
    .from("avatars")
    .insert({
      doctor_id: input.doctorId,
      image_url: imagePath,
      is_primary: input.isPrimary || (count ?? 0) === 0,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function setPrimaryAvatar(
  supabase: SupabaseClient<Database>,
  input: {
    doctorId: string;
    avatarId: string;
  },
) {
  const { error: clearError } = await supabase
    .from("avatars")
    .update({ is_primary: false })
    .eq("doctor_id", input.doctorId);

  if (clearError) {
    throw clearError;
  }

  const { error } = await supabase
    .from("avatars")
    .update({ is_primary: true })
    .eq("doctor_id", input.doctorId)
    .eq("id", input.avatarId);

  if (error) {
    throw error;
  }
}
