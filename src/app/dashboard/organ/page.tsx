import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";

export default async function OrganPage() {
  const context = await requireBrandContext("/dashboard/organ");
  const settings = await getBrandSettings(context.supabase, context.brand.id);

  return (
    <DashboardShell
      activePath="/dashboard/topics"
      hospitalName={settings.settings.hospital_name}
      title="Organ хэсэг"
      description="Phase 1 дээр organ content workflow-г идэвхгүй болгосон."
      actions={
        <Link href="/dashboard/settings" className="button-primary">
          Тохиргоо нээх
        </Link>
      }
    >
      <SectionCard
        title="Түр хаалттай"
        description="Зөвхөн doctor image болон brand asset storage урсгал идэвхтэй байна."
      >
        <div className="empty-state">
          <p className="muted-text">
            Organ avatar, scene continuity, video generation функцууд дараагийн
            шатанд тусад нь нэмэгдэнэ.
          </p>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
