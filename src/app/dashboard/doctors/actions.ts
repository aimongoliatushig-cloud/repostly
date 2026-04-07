"use server";

import { revalidatePath } from "next/cache";

import { requireBrandContext } from "@/lib/auth/context";
import {
  addDoctorAvatar,
  createDoctor,
  deleteDoctor,
  setPrimaryAvatar,
  updateDoctor,
} from "@/lib/doctors/service";
import {
  getErrorMessage,
  getFile,
  getString,
  redirectWithMessage,
} from "@/lib/server-action-helpers";

const DOCTORS_PATH = "/dashboard/doctors";

function getReturnTo(formData: FormData, fallback: string) {
  return getString(formData, "returnTo") || fallback;
}

export async function createDoctorAction(formData: FormData) {
  try {
    const context = await requireBrandContext(DOCTORS_PATH);

    await createDoctor(context.supabase, {
      brandId: context.brand.id,
      userId: context.user.id,
      nameMn: getString(formData, "name_mn"),
      specialtyMn: getString(formData, "specialty_mn"),
      portraitFile: getFile(formData, "portrait_file"),
    });

    revalidatePath("/dashboard");
    revalidatePath(DOCTORS_PATH);
    redirectWithMessage(DOCTORS_PATH, {
      message: "Эмч амжилттай нэмэгдлээ.",
    });
  } catch (error) {
    redirectWithMessage(DOCTORS_PATH, {
      error: getErrorMessage(error, "Эмч нэмэх үед алдаа гарлаа."),
    });
  }
}

export async function updateDoctorAction(formData: FormData) {
  const doctorId = getString(formData, "doctor_id");
  const returnTo = getReturnTo(formData, DOCTORS_PATH);

  try {
    const context = await requireBrandContext(returnTo);

    await updateDoctor(context.supabase, {
      doctorId,
      brandId: context.brand.id,
      nameMn: getString(formData, "name_mn"),
      specialtyMn: getString(formData, "specialty_mn"),
      portraitFile: getFile(formData, "portrait_file"),
    });

    revalidatePath("/dashboard");
    revalidatePath(DOCTORS_PATH);
    revalidatePath(`/dashboard/doctors/${doctorId}`);
    redirectWithMessage(returnTo, {
      message: "Эмчийн мэдээлэл шинэчлэгдлээ.",
    });
  } catch (error) {
    redirectWithMessage(returnTo, {
      error: getErrorMessage(error, "Эмчийн мэдээлэл шинэчлэх үед алдаа гарлаа."),
    });
  }
}

export async function deleteDoctorAction(formData: FormData) {
  const doctorId = getString(formData, "doctor_id");

  try {
    const context = await requireBrandContext(DOCTORS_PATH);

    await deleteDoctor(context.supabase, {
      brandId: context.brand.id,
      doctorId,
    });

    revalidatePath("/dashboard");
    revalidatePath(DOCTORS_PATH);
    revalidatePath(`/dashboard/doctors/${doctorId}`);
    redirectWithMessage(DOCTORS_PATH, {
      message: "Эмч устгагдлаа.",
    });
  } catch (error) {
    redirectWithMessage(DOCTORS_PATH, {
      error: getErrorMessage(error, "Эмч устгах үед алдаа гарлаа."),
    });
  }
}

export async function uploadDoctorAvatarAction(formData: FormData) {
  const doctorId = getString(formData, "doctor_id");
  const returnTo = getReturnTo(formData, `/dashboard/doctors/${doctorId}`);
  const imageFile = getFile(formData, "avatar_file");

  try {
    if (!imageFile) {
      throw new Error("Avatar зураг сонгоно уу.");
    }

    const context = await requireBrandContext(returnTo);

    await addDoctorAvatar(context.supabase, {
      brandId: context.brand.id,
      doctorId,
      imageFile,
      isPrimary: formData.get("is_primary") === "on",
    });

    revalidatePath(DOCTORS_PATH);
    revalidatePath(`/dashboard/doctors/${doctorId}`);
    redirectWithMessage(returnTo, {
      message: "Avatar зураг нэмэгдлээ.",
    });
  } catch (error) {
    redirectWithMessage(returnTo, {
      error: getErrorMessage(error, "Avatar зураг нэмэх үед алдаа гарлаа."),
    });
  }
}

export async function setPrimaryAvatarAction(formData: FormData) {
  const doctorId = getString(formData, "doctor_id");
  const avatarId = getString(formData, "avatar_id");
  const returnTo = getReturnTo(formData, `/dashboard/doctors/${doctorId}`);

  try {
    const context = await requireBrandContext(returnTo);

    await setPrimaryAvatar(context.supabase, {
      doctorId,
      avatarId,
    });

    revalidatePath(DOCTORS_PATH);
    revalidatePath(`/dashboard/doctors/${doctorId}`);
    redirectWithMessage(returnTo, {
      message: "Үндсэн avatar сонгогдлоо.",
    });
  } catch (error) {
    redirectWithMessage(returnTo, {
      error: getErrorMessage(error, "Үндсэн avatar сонгох үед алдаа гарлаа."),
    });
  }
}
