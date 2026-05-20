import { createClient } from "@supabase/supabase-js";

export const SAVED_TRIPS_TABLE = "saved_trips";
const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_SERVICE_KEY_ENV = "SUPABASE_SERVICE_ROLE_KEY";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigError() === null;
}

export function getSupabaseConfigError(): string | null {
  const url = process.env[SUPABASE_URL_ENV]?.trim();
  const serviceRoleKey = process.env[SUPABASE_SERVICE_KEY_ENV]?.trim();

  if (!url || !serviceRoleKey) {
    return `Add ${SUPABASE_URL_ENV} and ${SUPABASE_SERVICE_KEY_ENV} to enable saved trips.`;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return `${SUPABASE_URL_ENV} must start with https://.`;
    }
  } catch {
    return `${SUPABASE_URL_ENV} must be the full Supabase project URL, for example https://your-project.supabase.co.`;
  }

  if (serviceRoleKey.startsWith(`${SUPABASE_SERVICE_KEY_ENV}=`)) {
    return `Only paste the ${SUPABASE_SERVICE_KEY_ENV} value in Vercel, not the full key=value line.`;
  }

  return null;
}

export function createSupabaseAdminClient() {
  const configError = getSupabaseConfigError();

  if (configError) {
    throw new Error(configError);
  }

  return createClient(
    requireEnv(SUPABASE_URL_ENV),
    requireEnv(SUPABASE_SERVICE_KEY_ENV),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export function formatSupabaseError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Unable to reach Supabase.";
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("fetch failed") ||
    lowerMessage.includes("failed to fetch")
  ) {
    return [
      "Supabase request failed.",
      `In Vercel, verify ${SUPABASE_URL_ENV} is the full Project URL,`,
      `verify ${SUPABASE_SERVICE_KEY_ENV} is the service_role key,`,
      "then redeploy the project.",
    ].join(" ");
  }

  return message;
}
