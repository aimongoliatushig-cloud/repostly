import type { SupabaseClient } from "@supabase/supabase-js";

import { createSignedAssetUrl, uploadBrandFile } from "@/lib/storage/service";
import type {
  Database,
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/lib/supabase/database.types";

export type DoctorView = TableRow<"doctors"> & {
  imageUrl: string | null;
};

export async function listDoctors(
  supabase: SupabaseClient<Database>,
  brandId: string,
) {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const doctors = data ?? [];
  const signedUrls = await Promise.all(
    doctors.map((doctor) => createSignedAssetUrl(supabase, doctor.image_path)),
  );

  return doctors.map((doctor, index) => ({
    ...doctor,
    imageUrl: signedUrls[index],
  })) satisfies DoctorView[];
}

export async function createDoctor(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    userId: string;
    fullName: string;
    specialization: string;
    imageFile?: File | null;
  },
) {
  const doctorInsert: TableInsert<"doctors"> = {
    brand_id: input.brandId,
    full_name: input.fullName.trim(),
    specialization: input.specialization.trim(),
    created_by: input.userId,
  };

  if (input.imageFile && input.imageFile.size > 0) {
    const imagePath = await uploadBrandFile(
      supabase,
      input.brandId,
      "doctor-image",
      input.imageFile,
    );
    doctorInsert.image_path = imagePath;
  }

  const { error } = await supabase.from("doctors").insert(doctorInsert);

  if (error) {
    throw error;
  }
}

export async function updateDoctor(
  supabase: SupabaseClient<Database>,
  input: {
    doctorId: string;
    fullName: string;
    specialization: string;
    brandId: string;
    imageFile?: File | null;
  },
) {
  const updates: TableUpdate<"doctors"> = {
    full_name: input.fullName.trim(),
    specialization: input.specialization.trim(),
  };

  if (input.imageFile && input.imageFile.size > 0) {
    updates.image_path = await uploadBrandFile(
      supabase,
      input.brandId,
      "doctor-image",
      input.imageFile,
    );
  }

  const { error } = await supabase
    .from("doctors")
    .update(updates)
    .eq("id", input.doctorId);

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
