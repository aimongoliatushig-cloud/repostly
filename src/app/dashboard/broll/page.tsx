import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";

export default async function BrollPage() {
  const context = await requireBrandContext("/dashboard/broll");
  const settings = await getBrandSettings(context.supabase, context.brand.id);

  return (
    <DashboardShell
      activePath="/dashboard/topics"
      hospitalName={settings.settings.hospital_name}
      title="B-roll хэсэг"
      description="Phase 1 дээр энэ хэсгийг идэвхгүй болгосон. Одоогоор зөвхөн эмчийн зураг, avatar, brand asset хадгалалт ажиллана."
      actions={
        <Link href="/dashboard/doctors" className="button-primary">
          Эмчийн хэсэг рүү орох
        </Link>
      }
    >
      <SectionCard
        title="Түр хаалттай"
        description="Контент generation, audio upload, merge зэрэг урсгал дараагийн шатанд дахин нээгдэнэ."
      >
        <div className="empty-state">
          <p className="muted-text">
            Энэ хувилбарт doctor зураг, avatar болон logo, frame, outro зэрэг
            brand asset удирдлага дээр төвлөрч байна.
          </p>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
