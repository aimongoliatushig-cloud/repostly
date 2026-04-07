import { redirect } from "next/navigation";

export function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function getFile(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function redirectWithMessage(
  pathname: string,
  options: {
    message?: string;
    error?: string;
  },
): never {
  const params = new URLSearchParams();

  if (options.message) {
    params.set("message", options.message);
  }

  if (options.error) {
    params.set("error", options.error);
  }

  const suffix = params.toString();
  redirect(suffix ? `${pathname}?${suffix}` : pathname);
}
