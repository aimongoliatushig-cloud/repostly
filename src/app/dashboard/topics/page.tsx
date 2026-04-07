import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";

export default async function TopicsPage() {
  const context = await requireBrandContext("/dashboard/topics");
  const settings = await getBrandSettings(context.supabase, context.brand.id, {
    includeSignedUrls: false,
  });

  return (
    <DashboardShell
      activePath="/dashboard/topics"
      hospitalName={settings.settings.hospital_name}
      title="Сэдвүүд"
      description="Контентын сэдэв, ангиллын удирдлага дараагийн шатанд энэ хэсэгт нэмэгдэнэ."
      actions={
        <Link href="/dashboard" className="button-secondary">
          Самбар руу буцах
        </Link>
      }
    >
      <SectionCard
        title="Төлөв"
        description="Phase 1 дээр энэ хэсгийг placeholder байдлаар үлдээж байна."
      >
        <div className="empty-state">
          <p className="muted-text">
            Сэдвийн сан, контентын ангилал, автомат санал болголт дараагийн шатанд
            энд нэмэгдэнэ.
          </p>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
