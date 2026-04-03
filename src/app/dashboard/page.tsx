import Link from "next/link";

import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import {
  contentTypeLabel,
  dashboardMetrics,
  jobTypeLabel,
  providerLabel,
  queueJobs,
  recentProjects,
} from "@/lib/postly-data";

export default function DashboardPage() {
  return (
    <PostlyShell
      activePath="/dashboard"
      eyebrow="Брэндийн самбар"
      title="Кредит, queue, төслийн төлөвийг нэг дэлгэцээс"
      description="Хурдан preview loop, regenerate action, status tracking, credit validation логикийг dashboard төвөөс удирдах зохион байгуулалт."
      actions={
        <>
          <Link href="/videos/new/broll" className="button-primary">
            B-roll эхлүүлэх
          </Link>
          <Link href="/videos/new/organ-talk" className="button-secondary">
            Organ talk эхлүүлэх
          </Link>
        </>
      }
    >
      <section className="grid-4">
        {dashboardMetrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <p className="eyebrow">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className="metric-helper">{metric.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid-2">
        <SectionCard
          title="Хурдан action"
          description="Контент төрөл тус бүрээр шууд workflow эхлүүлэх entry point."
        >
          <div className="stack-sm">
            <Link href="/videos/new/broll" className="table-row">
              <strong>B-roll + эмч тайлбар</strong>
              <p className="muted-text">Doctor picker, MP3 upload, 7 scene storyboard.</p>
            </Link>
            <Link href="/videos/new/organ-talk" className="table-row">
              <strong>Organ talk</strong>
              <p className="muted-text">Avatar picker, 5 scene continuity, CTA script дотор орно.</p>
            </Link>
            <Link href="/settings/brand" className="table-row">
              <strong>Brand assets</strong>
              <p className="muted-text">Logo, frame PNG, outro video-г нэг дор шинэчилнэ.</p>
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          title="Queue монитор"
          description="Retry, provider, scene-level progress-ийг real-time харах panel."
        >
          <div className="stack-sm">
            {queueJobs.map((job) => (
              <article key={job.id} className="table-row">
                <div className="action-row" style={{ justifyContent: "space-between" }}>
                  <strong>{job.title}</strong>
                  <StatusPill status={job.status} />
                </div>
                <div className="key-value">
                  <span>Provider</span>
                  <span>{providerLabel(job.provider)}</span>
                </div>
                <div className="key-value">
                  <span>Job төрөл</span>
                  <span>{jobTypeLabel(job.jobType)}</span>
                </div>
                <div className="key-value">
                  <span>Retry</span>
                  <span>{job.retryCount}</span>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Сүүлийн төслүүд"
        description="Draft-оос completed хүртэл бүх reel төслүүд нэг timeline дээр харагдана."
      >
        <div className="stack-sm">
          {recentProjects.map((project) => (
            <article key={project.id} className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <div className="stack-xs">
                  <strong>{project.title}</strong>
                  <span className="muted-text">{contentTypeLabel(project.contentType)}</span>
                </div>
                <StatusPill status={project.status} />
              </div>
              <div className="grid-4">
                <div className="mini-card stack-xs">
                  <span className="eyebrow">Нүүр царай</span>
                  <strong>{project.doctorName ?? project.organAvatar}</strong>
                </div>
                <div className="mini-card stack-xs">
                  <span className="eyebrow">Scene</span>
                  <strong>{project.scenes}</strong>
                </div>
                <div className="mini-card stack-xs">
                  <span className="eyebrow">Лимит</span>
                  <strong>{project.durationLimitSeconds} сек</strong>
                </div>
                <div className="mini-card stack-xs">
                  <span className="eyebrow">Шинэчлэгдсэн</span>
                  <strong>{project.updatedAt}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
