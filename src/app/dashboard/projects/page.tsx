import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";

export default async function ProjectsPage() {
  const context = await requireBrandContext("/dashboard/projects");
  const settings = await getBrandSettings(context.supabase, context.brand.id, {
    includeSignedUrls: false,
  });

  return (
    <DashboardShell
      activePath="/dashboard/topics"
      hospitalName={settings.settings.hospital_name}
      title="Төслүүд"
      description="Phase 1 дээр төслийн generation workflow идэвхгүй байна."
      actions={
        <Link href="/dashboard" className="button-primary">
          Самбар руу буцах
        </Link>
      }
    >
      <SectionCard
        title="Төлөв"
        description="Одоогийн хувилбар зөвхөн суурь удирдлагын функцтэй."
      >
        <div className="empty-state">
          <p className="muted-text">
            Төслийн жагсаалт, storyboard, merge, render flow-уудыг энэ үе шатанд
            ашиглахгүй.
          </p>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
