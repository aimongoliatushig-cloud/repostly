import Link from "next/link";

import { FeedbackBanner } from "@/components/feedback-banner";
import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { requireBrandContext } from "@/lib/auth/context";
import { getDashboardSummary } from "@/lib/dashboard/service";
import {
  contentTypeLabel,
  jobTypeLabel,
  providerLabel,
} from "@/lib/postly-data";

import { logoutAction } from "./actions";

function formatMnt(value: number) {
  return `${new Intl.NumberFormat("mn-MN").format(value)} ₮`;
}

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
  const summary = await getDashboardSummary(context.supabase, context.brand.id);

  return (
    <PostlyShell
      activePath="/dashboard"
      eyebrow={context.brand.name}
      title="Кредит, queue, төслийн төлөвийг нэг дэлгэцээс"
      description="Одоогийн брэнд context, subscription, production queue, recent project-уудыг real-time өгөгдлөөр харуулна."
      actions={
        <>
          <Link href="/dashboard/broll" className="button-primary">
            B-roll эхлүүлэх
          </Link>
          <Link href="/dashboard/organ" className="button-secondary">
            Organ talk эхлүүлэх
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="button-ghost">
              Гарах
            </button>
          </form>
        </>
      }
    >
      {params.error ? <FeedbackBanner tone="error" message={params.error} /> : null}
      {params.message ? (
        <FeedbackBanner tone="success" message={params.message} />
      ) : null}

      <section className="grid-4">
        <article className="metric-card">
          <p className="eyebrow">Идэвхтэй багц</p>
          <p className="metric-value">
            {summary.subscription?.subscription_plans?.credits ?? 0}
          </p>
          <p className="metric-helper">
            {summary.subscription?.subscription_plans?.name ?? "Багц идэвхгүй"}
          </p>
        </article>
        <article className="metric-card">
          <p className="eyebrow">Үлдсэн кредит</p>
          <p className="metric-value">{summary.remainingCredits}</p>
          <p className="metric-helper">1 финал reel = 1 кредит</p>
        </article>
        <article className="metric-card">
          <p className="eyebrow">Ашигласан кредит</p>
          <p className="metric-value">{summary.usedCredits}</p>
          <p className="metric-helper">Энэ cycle дээрх хэрэглээ</p>
        </article>
        <article className="metric-card">
          <p className="eyebrow">Холбогдсон эмч</p>
          <p className="metric-value">{summary.doctorsCount}</p>
          <p className="metric-helper">{summary.projectsCount} төсөл бүртгэлтэй</p>
        </article>
      </section>

      <section className="grid-2">
        <SectionCard
          title="Брэндийн snapshot"
          description="CTA болон overlay-д ашиглагдах contact мэдээлэл, subscription summary."
        >
          <div className="stack-sm">
            <div className="key-value">
              <span>Брэнд</span>
              <strong>{context.brand.name}</strong>
            </div>
            <div className="key-value">
              <span>Утас</span>
              <strong>{context.brand.phone || "Оруулаагүй"}</strong>
            </div>
            <div className="key-value">
              <span>Website</span>
              <strong>{context.brand.website || "Оруулаагүй"}</strong>
            </div>
            <div className="key-value">
              <span>Сарын үнэ</span>
              <strong>
                {summary.subscription?.subscription_plans
                  ? formatMnt(summary.subscription.subscription_plans.price_mnt)
                  : "Тодорхойгүй"}
              </strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Queue монитор"
          description="OpenAI, KIE.ai, merge job-уудын хамгийн сүүлийн төлөв."
        >
          <div className="stack-sm">
            {summary.recentJobs.length === 0 ? (
              <article className="table-row">
                <p className="muted-text">Одоогоор queue дээр ажил алга байна.</p>
              </article>
            ) : (
              summary.recentJobs.map((job) => (
                <article key={job.id} className="table-row">
                  <div
                    className="action-row"
                    style={{ justifyContent: "space-between" }}
                  >
                    <strong>{jobTypeLabel(job.job_type)}</strong>
                    <StatusPill status={job.status} />
                  </div>
                  <div className="key-value">
                    <span>Provider</span>
                    <span>{providerLabel(job.provider)}</span>
                  </div>
                  <div className="key-value">
                    <span>Retry</span>
                    <span>{job.retry_count}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Сүүлийн төслүүд"
        description="Planning-оос completed хүртэлх бүх reel төслүүд хадгалагдана."
      >
        <div className="stack-sm">
          {summary.recentProjects.length === 0 ? (
            <article className="table-row">
              <p className="muted-text">
                Одоогоор төсөл алга байна. Доорх quick action-аас шинэ төсөл
                эхлүүлнэ үү.
              </p>
            </article>
          ) : (
            summary.recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="table-row"
              >
                <div
                  className="action-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <div className="stack-xs">
                    <strong>{project.title}</strong>
                    <span className="muted-text">
                      {contentTypeLabel(project.content_type)}
                    </span>
                  </div>
                  <StatusPill status={project.status} />
                </div>
                <div className="grid-4">
                  <div className="mini-card stack-xs">
                    <span className="eyebrow">Нүүр дүр</span>
                    <strong>{project.doctorName ?? project.organLabel ?? "-"}</strong>
                  </div>
                  <div className="mini-card stack-xs">
                    <span className="eyebrow">Лимит</span>
                    <strong>{project.duration_limit_seconds} сек</strong>
                  </div>
                  <div className="mini-card stack-xs">
                    <span className="eyebrow">Шинэчлэгдсэн</span>
                    <strong>
                      {new Intl.DateTimeFormat("mn-MN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(project.updated_at))}
                    </strong>
                  </div>
                  <div className="mini-card stack-xs">
                    <span className="eyebrow">CTA</span>
                    <strong>{project.apply_outro ? "Outro" : "Script"}</strong>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </SectionCard>

      <section className="grid-3">
        <Link href="/dashboard/broll" className="panel-card stack-sm">
          <strong>B-roll workflow</strong>
          <p className="muted-text">
            Эмч + MP3 аудио ашиглан 7 хүртэлх scene-тэй reel үүсгэнэ.
          </p>
        </Link>
        <Link href="/dashboard/organ" className="panel-card stack-sm">
          <strong>Organ workflow</strong>
          <p className="muted-text">
            5 x 8 секундийн organ avatar storyboard үүсгэнэ.
          </p>
        </Link>
        <Link href="/dashboard/settings" className="panel-card stack-sm">
          <strong>Брэнд asset</strong>
          <p className="muted-text">
            Лого, frame, outro video болон contact мэдээллээ шинэчилнэ.
          </p>
        </Link>
      </section>
    </PostlyShell>
  );
}
