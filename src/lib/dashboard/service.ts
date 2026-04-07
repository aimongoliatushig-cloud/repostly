import type { SupabaseClient } from "@supabase/supabase-js";

import { countDoctors, getLatestDoctor } from "@/lib/doctors/service";
import type { Database } from "@/lib/supabase/database.types";
import type { HospitalDashboardSummary } from "@/types/hospital";

export async function getDashboardSummary(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    hospitalName: string;
  },
) {
  const [totalDoctors, recentDoctor] = await Promise.all([
    countDoctors(supabase, input.brandId),
    getLatestDoctor(supabase, input.brandId),
  ]);

  return {
    totalDoctors,
    activeProjects: 0,
    recentDoctor,
    hospitalName: input.hospitalName,
  } satisfies HospitalDashboardSummary;
}
