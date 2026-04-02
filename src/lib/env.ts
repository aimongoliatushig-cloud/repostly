const integrations = [
  {
    key: "OPENAI_API_KEY",
    label: "OpenAI",
    hint: "Used for transcription and script analysis.",
  },
  {
    key: "HEYGEN_API_KEY",
    label: "HeyGen",
    hint: "Used for lip-sync video generation.",
  },
  {
    key: "SUPABASE_URL",
    label: "Supabase URL",
    hint: "Used for storage, uploads, and workflow state.",
  },
  {
    key: "SUPABASE_ANON_KEY",
    label: "Supabase anon key",
    hint: "Used for browser-safe client access.",
  },
] as const;

export type IntegrationKey = (typeof integrations)[number]["key"];

function getEnvValue(key: IntegrationKey) {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : undefined;
}

export function getIntegrationStatuses() {
  return integrations.map((integration) => ({
    ...integration,
    configured: Boolean(getEnvValue(integration.key)),
  }));
}

export function getMissingIntegrationKeys() {
  return getIntegrationStatuses()
    .filter((integration) => !integration.configured)
    .map((integration) => integration.key);
}
