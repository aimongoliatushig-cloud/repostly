import Link from "next/link";

import { FeedbackBanner } from "@/components/feedback-banner";
import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { requireBrandContext } from "@/lib/auth/context";
import { listProjects } from "@/lib/projects/service";
import { contentTypeLabel } from "@/lib/postly-data";

type ProjectsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;
  const context = await requireBrandContext("/dashboard/projects");
  const projects = await listProjects(context.supabase, context.brand.id);

  return (
    <PostlyShell
      activePath="/dashboard/projects"
      eyebrow="Төслүүд"
      title="B-roll болон Organ talk төслүүд"
      description="Draft, planning, rendering, completed бүх төслүүд энд хадгалагдаж, detail workflow руу нээгдэнэ."
      actions={
        <>
          <Link href="/dashboard/broll" className="button-primary">
            B-roll төсөл
          </Link>
          <Link href="/dashboard/organ" className="button-secondary">
            Organ talk төсөл
          </Link>
        </>
      }
    >
      {params.error ? <FeedbackBanner tone="error" message={params.error} /> : null}
      {params.message ? (
        <FeedbackBanner tone="success" message={params.message} />
      ) : null}

      <SectionCard
        title="Бүх төслүүд"
        description="Project card бүр дээр storyboard, queue, final merge төлөв харагдана."
      >
        <div className="stack-sm">
          {projects.length === 0 ? (
            <article className="table-row">
              <p className="muted-text">
                Одоогоор төсөл үүсээгүй байна. Шинэ B-roll эсвэл Organ talk төсөл
                эхлүүлнэ үү.
              </p>
            </article>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="table-row"
              >
                <div className="action-row" style={{ justifyContent: "space-between" }}>
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
                    <span className="eyebrow">Doctor / Avatar</span>
                    <strong>{project.doctorName ?? project.organLabel ?? "-"}</strong>
                  </div>
                  <div className="mini-card stack-xs">
                    <span className="eyebrow">Хугацааны лимит</span>
                    <strong>{project.duration_limit_seconds} сек</strong>
                  </div>
                  <div className="mini-card stack-xs">
                    <span className="eyebrow">Frame</span>
                    <strong>{project.apply_frame ? "Тийм" : "Үгүй"}</strong>
                  </div>
                  <div className="mini-card stack-xs">
                    <span className="eyebrow">Outro</span>
                    <strong>{project.apply_outro ? "Тийм" : "Үгүй"}</strong>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
