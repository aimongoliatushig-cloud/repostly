import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublishableKey } from "@/lib/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = getSupabasePublishableKey();

export async function createClient(
  cookieStore?: Awaited<ReturnType<typeof cookies>>,
) {
  const resolvedCookieStore = cookieStore ?? (await cookies());

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return resolvedCookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            resolvedCookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always persist cookies directly.
          // The proxy refresh path handles the normal token rotation case.
        }
      },
    },
  });
}
