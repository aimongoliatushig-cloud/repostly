import Link from "next/link";

import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { FeedbackBanner } from "@/components/feedback-banner";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";
import { getDashboardSummary } from "@/lib/dashboard/service";

type DashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const context = await requireBrandContext("/dashboard");
  const brandSettings = await getBrandSettings(context.supabase, context.brand.id);
  const summary = await getDashboardSummary(context.supabase, {
    brandId: context.brand.id,
    hospitalName: brandSettings.settings.hospital_name,
  });

  return (
    <DashboardShell
      activePath="/dashboard"
      hospitalName={summary.hospitalName}
      title="Хянах самбар"
      description="Эмчийн сан, avatar ашиглалт, брэндийн үндсэн тохиргооны төлөвийг нэг дэлгэцээс харуулна."
      actions={
        <>
          <Link href="/dashboard/doctors" className="button-primary">
            Эмч нэмэх
          </Link>
          <Link href="/dashboard/settings" className="button-secondary">
            Тохиргоо нээх
          </Link>
        </>
      }
    >
      {params.error ? <FeedbackBanner tone="error" message={params.error} /> : null}
      {params.message ? (
        <FeedbackBanner tone="success" message={params.message} />
      ) : null}

      <section className="dashboard-stats-grid">
        <DashboardMetricCard
          label="Нийт эмч"
          value={summary.totalDoctors}
          helper="Системд бүртгэлтэй идэвхтэй эмч"
        />
        <DashboardMetricCard
          label="Идэвхтэй төслүүд"
          value={summary.activeProjects}
          helper="Дараагийн шатанд бодит төслийн тоо холбогдоно"
        />
        <DashboardMetricCard
          label="Сүүлийн нэмсэн эмч"
          value={summary.recentDoctor?.name_mn ?? "Одоогоор алга"}
          helper={
            summary.recentDoctor?.specialty_mn ?? "Шинэ эмч бүртгэгдээгүй байна"
          }
        />
      </section>

      <section className="dashboard-split-grid">
        <SectionCard
          title="Сүүлийн нэмсэн эмч"
          description="Doctor management дээр нэмэгдсэн хамгийн сүүлийн бүртгэл."
        >
          {summary.recentDoctor ? (
            <article className="doctor-highlight-card">
              <div className="doctor-highlight-head">
                <div className="stack-xs">
                  <strong>{summary.recentDoctor.name_mn}</strong>
                  <span className="muted-text">
                    {summary.recentDoctor.specialty_mn}
                  </span>
                  <span className="muted-text">
                    Avatar: {summary.recentDoctor.avatarCount}
                  </span>
                </div>
                {summary.recentDoctor.portraitSignedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="doctor-highlight-image"
                    src={summary.recentDoctor.portraitSignedUrl}
                    alt={summary.recentDoctor.name_mn}
                  />
                ) : null}
              </div>
              <div className="action-row">
                <Link
                  href={`/dashboard/doctors/${summary.recentDoctor.id}`}
                  className="button-secondary"
                >
                  Дэлгэрэнгүй харах
                </Link>
                <Link href="/dashboard/doctors" className="button-ghost">
                  Жагсаалт руу
                </Link>
              </div>
            </article>
          ) : (
            <div className="empty-state">
              <p className="muted-text">
                Эмчийн бүртгэл үүсмэгц энд хамгийн сүүлийн мэдээлэл харагдана.
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Брэндийн төлөв"
          description="Контентын төгсгөлийн asset болон холбоо барих мэдээллийн товч харагдац."
        >
          <div className="stack-sm">
            <div className="key-value">
              <span>Эмнэлгийн нэр</span>
              <strong>{brandSettings.settings.hospital_name}</strong>
            </div>
            <div className="key-value">
              <span>Утас</span>
              <strong>{brandSettings.settings.phone || "Оруулаагүй"}</strong>
            </div>
            <div className="key-value">
              <span>Вэбсайт</span>
              <strong>{brandSettings.settings.website || "Оруулаагүй"}</strong>
            </div>
            <div className="key-value">
              <span>Facebook</span>
              <strong>{brandSettings.settings.facebook || "Оруулаагүй"}</strong>
            </div>
          </div>
        </SectionCard>
      </section>
    </DashboardShell>
  );
}
