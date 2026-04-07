"use server";

import { revalidatePath } from "next/cache";

import { requireBrandContext } from "@/lib/auth/context";
import { saveBrandSettings } from "@/lib/brands/service";
import {
  getErrorMessage,
  getFile,
  getString,
  redirectWithMessage,
} from "@/lib/server-action-helpers";

const SETTINGS_PATH = "/dashboard/settings";

export async function saveBrandSettingsAction(formData: FormData) {
  try {
    const context = await requireBrandContext(SETTINGS_PATH);

    await saveBrandSettings(context.supabase, {
      brandId: context.brand.id,
      userId: context.user.id,
      hospitalName: getString(formData, "hospital_name"),
      phone: getString(formData, "phone"),
      website: getString(formData, "website"),
      facebook: getString(formData, "facebook"),
      addressMn: getString(formData, "address_mn"),
      logoFile: getFile(formData, "logo_file"),
      frameFile: getFile(formData, "frame_file"),
      outroFile: getFile(formData, "outro_file"),
    });

    revalidatePath("/dashboard");
    revalidatePath(SETTINGS_PATH);
    redirectWithMessage(SETTINGS_PATH, {
      message: "Брэндийн тохиргоо хадгалагдлаа.",
    });
  } catch (error) {
    redirectWithMessage(SETTINGS_PATH, {
      error: getErrorMessage(error, "Тохиргоо хадгалах үед алдаа гарлаа."),
    });
  }
}
