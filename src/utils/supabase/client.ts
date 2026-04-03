import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublishableKey } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = getSupabasePublishableKey();

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseKey!);
}
