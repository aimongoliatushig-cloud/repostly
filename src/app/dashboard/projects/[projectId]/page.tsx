import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const context = await requireBrandContext(`/dashboard/projects/${projectId}`);
  const settings = await getBrandSettings(context.supabase, context.brand.id, {
    includeSignedUrls: false,
  });

  return (
    <DashboardShell
      activePath="/dashboard/topics"
      hospitalName={settings.settings.hospital_name}
      title="Төслийн дэлгэрэнгүй"
      description="Phase 1 дээр төслийн дэлгэрэнгүй workflow түр хаалттай байна."
      actions={
        <Link href="/dashboard/projects" className="button-primary">
          Төслүүд рүү буцах
        </Link>
      }
    >
      <SectionCard
        title="Түр хаалттай"
        description="Doctor image болон brand asset management-ийг тогтворжуулах хүртэл энэ хэсгийг ашиглахгүй."
      >
        <div className="empty-state">
          <p className="muted-text">
            Одоогийн focus нь эмчийн зураг, avatar, logo, frame, outro болон
            эмнэлгийн холбоо барих мэдээлэл хадгалалт юм.
          </p>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
