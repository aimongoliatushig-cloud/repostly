import type { SupabaseClient } from "@supabase/supabase-js";

import { listDoctors } from "@/lib/doctors/service";
import type { Database } from "@/lib/supabase/database.types";
import type { HospitalDashboardSummary } from "@/types/hospital";

export async function getDashboardSummary(
  supabase: SupabaseClient<Database>,
  input: {
    brandId: string;
    hospitalName: string;
  },
) {
  const doctors = await listDoctors(supabase, input.brandId);

  return {
    totalDoctors: doctors.length,
    activeProjects: 0,
    recentDoctor: doctors[0] ?? null,
    hospitalName: input.hospitalName,
  } satisfies HospitalDashboardSummary;
}
