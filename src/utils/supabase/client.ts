import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublishableKey } from "@/lib/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = getSupabasePublishableKey();

export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseKey!);
}
