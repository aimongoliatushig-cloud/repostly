export async function parseRequestData(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, FormDataEntryValue>;
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return {};
  }

  return Object.fromEntries(formData.entries());
}

export function requestWantsJson(request: Request) {
  const accept = request.headers.get("accept") || "";
  const contentType = request.headers.get("content-type") || "";

  return accept.includes("application/json") || contentType.includes("application/json");
}
