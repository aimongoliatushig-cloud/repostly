type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

function includesIdentifier(error: SupabaseLikeError, identifier: string) {
  const text = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(identifier.toLowerCase());
}

export function isMissingRelationError(
  error: unknown,
  relation?: string,
): error is SupabaseLikeError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as SupabaseLikeError;
  const relationMissing =
    candidate.code === "PGRST205" || candidate.code === "42P01";

  if (!relationMissing) {
    return false;
  }

  return relation ? includesIdentifier(candidate, relation) : true;
}

export function isMissingColumnError(
  error: unknown,
  column?: string,
): error is SupabaseLikeError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as SupabaseLikeError;
  const columnMissing =
    candidate.code === "PGRST204" || candidate.code === "42703";

  if (!columnMissing) {
    return false;
  }

  return column ? includesIdentifier(candidate, column) : true;
}
