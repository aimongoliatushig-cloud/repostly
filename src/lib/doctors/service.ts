import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createSignedAssetUrl,
  createSignedAssetUrls,
  uploadBrandFile,
} from "@/lib/storage/service";
import type {
  Database,
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/lib/supabase/database.types";
import {
  isMissingColumnError,
  isMissingRelationError,
} from "@/lib/supabase/errors";
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

function normalizeDoctorRow(doctor: TableRow<"doctors">) {
  return {
    ...doctor,
    name_mn: doctor.name_mn ?? doctor.full_name,
    specialty_mn: doctor.specialty_mn ?? doctor.specialization,
    portrait_url: doctor.portrait_url ?? doctor.image_path,
  } satisfies TableRow<"doctors">;
}

async function signAvatarRows(
  supabase: SupabaseClient<Database>,
  avatars: TableRow<"avatars">[],
) {
  const signedUrls = await createSignedAssetUrls(
    supabase,
    avatars.map((avatar) => avatar.image_url),
  );

  return avatars.map((avatar, index) => ({
    ...avatar,
    imageSignedUrl: signedUrls[index],
  })) satisfies AvatarView[];
}

async function getDoctorAvatarRowsByDoctorIds(
  supabase: SupabaseClient<Database>,
  doctorIds: string[],
) {
  if (doctorIds.length === 0) {
    return new Map<string, TableRow<"avatars">[]>();
  }

  const { data, error } = await supabase
    .from("avatars")
    .select("*")
    .in("doctor_id", doctorIds)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error, "avatars")) {
      return new Map<string, TableRow<"avatars">[]>();
    }

    throw error;
  }

  const grouped = new Map<string, TableRow<"avatars">[]>();

  (data ?? []).forEach((avatar) => {
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
  const normalizedDoctors = doctors.map(normalizeDoctorRow);
  const [avatarRowsMap, portraitUrls] = await Promise.all([
    getDoctorAvatarRowsByDoctorIds(
      supabase,
      normalizedDoctors.map((doctor) => doctor.id),
    ),
    createSignedAssetUrls(
      supabase,
      normalizedDoctors.map(
        (doctor) => doctor.portrait_url ?? doctor.image_path ?? null,
      ),
    ),
  ]);

  const primaryAvatarRows = normalizedDoctors.map((doctor) => {
    const avatarRows = avatarRowsMap.get(doctor.id) ?? [];
    return avatarRows.find((avatar) => avatar.is_primary) ?? null;
  });

  const primaryAvatarUrls = await createSignedAssetUrls(
    supabase,
    primaryAvatarRows.map((avatar) => avatar?.image_url ?? null),
  );

  return normalizedDoctors.map((doctor, index) => {
    const avatarRows = avatarRowsMap.get(doctor.id) ?? [];
    const primaryAvatarRow = primaryAvatarRows[index];
    const primaryAvatar =
      primaryAvatarRow && primaryAvatarUrls[index]
        ? ({
            ...primaryAvatarRow,
            imageSignedUrl: primaryAvatarUrls[index],
          } satisfies AvatarView)
        : null;

    return {
      ...doctor,
      portraitSignedUrl: portraitUrls[index],
      avatarCount: avatarRows.length,
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

export async function countDoctors(
  supabase: SupabaseClient<Database>,
  brandId: string,
) {
  const { count, error } = await supabase
    .from("doctors")
    .select("*", { count: "exact", head: true })
    .eq("brand_id", brandId)
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getLatestDoctor(
  supabase: SupabaseClient<Database>,
  brandId: string,
) {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("brand_id", brandId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const item = (data ?? [])[0];

  if (!item) {
    return null;
  }

  const mapped = await mapDoctorListItems(supabase, [item]);
  return mapped[0] ?? null;
}

export async function getDoctorDetail(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    doctorId: string;
  },
) {
  const { data: rawDoctor, error } = await supabase
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

  if (avatarError && !isMissingRelationError(avatarError, "avatars")) {
    throw avatarError;
  }

  const doctor = normalizeDoctorRow(rawDoctor);
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

  const portraitFile = input.portraitFile ?? input.imageFile;
  let portraitPath: string | null = null;

  if (portraitFile && portraitFile.size > 0) {
    portraitPath = await uploadBrandFile(
      supabase,
      input.brandId,
      "doctor-image",
      portraitFile,
    );
  }

  const modernInsert: TableInsert<"doctors"> = {
    brand_id: input.brandId,
    name_mn: nameMn,
    specialty_mn: specialtyMn,
    portrait_url: portraitPath,
    full_name: nameMn,
    specialization: specialtyMn,
    image_path: portraitPath,
    created_by: input.userId,
    is_active: true,
  };

  const modernResult = await supabase
    .from("doctors")
    .insert(modernInsert)
    .select("*")
    .single();

  if (!modernResult.error) {
    return normalizeDoctorRow(modernResult.data);
  }

  if (
    !isMissingColumnError(modernResult.error, "name_mn") &&
    !isMissingColumnError(modernResult.error, "specialty_mn") &&
    !isMissingColumnError(modernResult.error, "portrait_url")
  ) {
    throw modernResult.error;
  }

  const legacyInsert: TableInsert<"doctors"> = {
    brand_id: input.brandId,
    full_name: nameMn,
    specialization: specialtyMn,
    image_path: portraitPath,
    created_by: input.userId,
    is_active: true,
  };

  const legacyResult = await supabase
    .from("doctors")
    .insert(legacyInsert)
    .select("*")
    .single();

  if (legacyResult.error) {
    throw legacyResult.error;
  }

  return normalizeDoctorRow(legacyResult.data);
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

  const portraitFile = input.portraitFile ?? input.imageFile;
  let portraitPath: string | null = null;

  if (portraitFile && portraitFile.size > 0) {
    portraitPath = await uploadBrandFile(
      supabase,
      input.brandId,
      "doctor-image",
      portraitFile,
    );
  }

  const modernUpdates: TableUpdate<"doctors"> = {
    name_mn: nameMn,
    specialty_mn: specialtyMn,
    full_name: nameMn,
    specialization: specialtyMn,
  };

  if (portraitPath) {
    modernUpdates.portrait_url = portraitPath;
    modernUpdates.image_path = portraitPath;
  }

  const modernResult = await supabase
    .from("doctors")
    .update(modernUpdates)
    .eq("id", input.doctorId)
    .eq("brand_id", input.brandId);

  if (!modernResult.error) {
    return;
  }

  if (
    !isMissingColumnError(modernResult.error, "name_mn") &&
    !isMissingColumnError(modernResult.error, "specialty_mn") &&
    !isMissingColumnError(modernResult.error, "portrait_url")
  ) {
    throw modernResult.error;
  }

  const legacyUpdates: TableUpdate<"doctors"> = {
    full_name: nameMn,
    specialization: specialtyMn,
  };

  if (portraitPath) {
    legacyUpdates.image_path = portraitPath;
  }

  const legacyResult = await supabase
    .from("doctors")
    .update(legacyUpdates)
    .eq("id", input.doctorId)
    .eq("brand_id", input.brandId);

  if (legacyResult.error) {
    throw legacyResult.error;
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

function getAvatarDisabledError() {
  return new Error(
    "Avatar хүснэгт идэвхгүй байна. Одоогоор эмчийн үндсэн portrait зураг ашиглана.",
  );
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
    if (isMissingRelationError(countError, "avatars")) {
      throw getAvatarDisabledError();
    }

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
    if (isMissingRelationError(error, "avatars")) {
      throw getAvatarDisabledError();
    }

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
    if (isMissingRelationError(clearError, "avatars")) {
      throw getAvatarDisabledError();
    }

    throw clearError;
  }

  const { error } = await supabase
    .from("avatars")
    .update({ is_primary: true })
    .eq("doctor_id", input.doctorId)
    .eq("id", input.avatarId);

  if (error) {
    if (isMissingRelationError(error, "avatars")) {
      throw getAvatarDisabledError();
    }

    throw error;
  }
}
