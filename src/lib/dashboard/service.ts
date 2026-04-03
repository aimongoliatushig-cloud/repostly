import type { SupabaseClient } from "@supabase/supabase-js";

import { getActiveSubscription, listCreditLedger } from "@/lib/brands/service";
import { listProjects } from "@/lib/projects/service";
import type { Database } from "@/lib/supabase/database.types";

export async function getDashboardSummary(
  supabase: SupabaseClient<Database>,
  brandId: string,
) {
  const [
    subscription,
    recentProjects,
    doctorCountResponse,
    projectCountResponse,
    jobResponse,
    ledger,
  ] = await Promise.all([
    getActiveSubscription(supabase, brandId),
    listProjects(supabase, brandId),
    supabase
      .from("doctors")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .eq("is_active", true),
    supabase
      .from("video_projects")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId),
    supabase
      .from("generation_jobs")
      .select(
        `
          *,
          video_projects!inner (
            brand_id
          )
        `,
      )
      .eq("video_projects.brand_id", brandId)
      .order("created_at", { ascending: false })
      .limit(8),
    listCreditLedger(supabase, brandId, 8),
  ]);

  if (doctorCountResponse.error) {
    throw doctorCountResponse.error;
  }

  if (projectCountResponse.error) {
    throw projectCountResponse.error;
  }

  if (jobResponse.error) {
    throw jobResponse.error;
  }

  const totalCredits = subscription?.total_credits ?? 0;
  const remainingCredits = subscription?.remaining_credits ?? 0;

  return {
    subscription,
    totalCredits,
    remainingCredits,
    usedCredits: Math.max(totalCredits - remainingCredits, 0),
    doctorsCount: doctorCountResponse.count ?? 0,
    projectsCount: projectCountResponse.count ?? 0,
    recentProjects: recentProjects.slice(0, 6),
    recentJobs: jobResponse.data ?? [],
    recentLedger: ledger,
  };
}
