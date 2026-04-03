const integrations = [
  {
    key: "OPENAI_API_KEY",
    label: "OpenAI",
    hint: "Topic, hook, script, storyboard болон animation plan гаргана.",
  },
  {
    key: "KIE_API_KEY",
    label: "KIE.ai",
    hint: "Scene clip, voice, seed continuity-тэй генерац хийнэ.",
  },
  {
    key: "KIE_API_BASE_URL",
    label: "KIE API URL",
    hint: "Official jobs endpoint-уудын base URL.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Supabase URL",
    hint: "Auth, database, storage connection.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
    label: "Supabase publishable key",
    hint: "Client-side auth session болон public access.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase service role",
    hint: "Queue worker, credit ledger, secure server write.",
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

export function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function hasSupabaseBrowserEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublishableKey());
}

export function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

export function getOpenAiModel() {
  return process.env.OPENAI_MODEL_SCRIPT?.trim() || "gpt-4.1-mini";
}

export function hasOpenAiEnv() {
  return Boolean(getOpenAiApiKey());
}

export function getKieApiKey() {
  return process.env.KIE_API_KEY?.trim();
}

export function getKieApiBaseUrl() {
  return process.env.KIE_API_BASE_URL?.trim() || "https://api.kie.ai";
}

export function getKieCallbackSecret() {
  return process.env.KIE_CALLBACK_SECRET?.trim();
}

export function hasKieEnv() {
  return Boolean(getKieApiKey());
}
