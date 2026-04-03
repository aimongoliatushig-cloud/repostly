import Link from "next/link";

import { FeedbackBanner } from "@/components/feedback-banner";
import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { requireBrandContext } from "@/lib/auth/context";
import { getProjectDetail } from "@/lib/projects/service";
import {
  contentTypeLabel,
  jobTypeLabel,
  providerLabel,
} from "@/lib/postly-data";

import {
  mergeProjectAction,
  pollJobAction,
  queueSceneGenerationAction,
  regeneratePlanningAction,
  saveSceneAction,
} from "../../actions";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const context = await requireBrandContext("/dashboard/projects");
  const detail = await getProjectDetail(context.supabase, resolvedParams.projectId);
  const metadata =
    typeof detail.project.metadata === "object" && detail.project.metadata
      ? (detail.project.metadata as Record<string, unknown>)
      : {};
  const planningNote =
    typeof metadata.planningNote === "string" ? metadata.planningNote : null;
  const readyScenes = detail.scenes.filter((scene) => scene.status === "ready");

  return (
    <PostlyShell
      activePath="/dashboard/projects"
      eyebrow={contentTypeLabel(detail.project.content_type)}
      title={detail.project.title}
      description="Storyboard, scene generation, polling, merge, download гэсэн бүх алхмыг нэг workflow дээрээс удирдана."
      actions={
        <>
          <Link href="/dashboard/projects" className="button-secondary">
            Бүх төслүүд
          </Link>
          <form action={regeneratePlanningAction}>
            <input type="hidden" name="projectId" value={detail.project.id} />
            <button type="submit" className="button-ghost">
              Storyboard дахин үүсгэх
            </button>
          </form>
          <form action={mergeProjectAction}>
            <input type="hidden" name="projectId" value={detail.project.id} />
            <button type="submit" className="button-primary">
              Финал merge
            </button>
          </form>
        </>
      }
    >
      {resolvedSearch.error ? (
        <FeedbackBanner tone="error" message={resolvedSearch.error} />
      ) : null}
      {resolvedSearch.message ? (
        <FeedbackBanner tone="success" message={resolvedSearch.message} />
      ) : null}

      <section className="grid-2">
        <SectionCard
          title="Төслийн мэдээлэл"
          description="Brand context, planning, merge options, финал төлөв."
        >
          <div className="stack-sm">
            <div className="key-value">
              <span>Төрөл</span>
              <strong>{contentTypeLabel(detail.project.content_type)}</strong>
            </div>
            <div className="key-value">
              <span>Doctor / Avatar</span>
              <strong>
                {detail.project.doctorName ?? detail.project.organLabel ?? "-"}
              </strong>
            </div>
            <div className="key-value">
              <span>Hook</span>
              <strong>{detail.project.hook ?? "Одоогоор үүсээгүй"}</strong>
            </div>
            <div className="key-value">
              <span>Статус</span>
              <StatusPill status={detail.project.status} />
            </div>
            <div className="key-value">
              <span>Frame</span>
              <strong>{detail.project.apply_frame ? "Тийм" : "Үгүй"}</strong>
            </div>
            <div className="key-value">
              <span>Outro</span>
              <strong>{detail.project.apply_outro ? "Тийм" : "Үгүй"}</strong>
            </div>
            {planningNote ? (
              <article className="table-row">
                <strong>Planning note</strong>
                <p className="muted-text">{planningNote}</p>
              </article>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Final output"
          description="Merge амжилттай болвол энд тоглуулж, татаж авна."
        >
          <div className="stack-sm">
            <article className="table-row">
              <strong>Бэлэн scene</strong>
              <p className="muted-text">
                {readyScenes.length} / {detail.scenes.length}
              </p>
            </article>
            {detail.finalVideoAssetUrl ? (
              <article className="table-row">
                <video
                  controls
                  src={detail.finalVideoAssetUrl}
                  style={{ width: "100%", borderRadius: 18 }}
                />
                <a
                  className="button-primary"
                  href={detail.finalVideoAssetUrl}
                  download
                >
                  Видео татах
                </a>
              </article>
            ) : (
              <article className="table-row">
                <p className="muted-text">
                  Финал video хараахан бэлэн болоогүй байна. Бүх scene clip-ээ
                  generate хийсний дараа merge хийнэ.
                </p>
              </article>
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Storyboard картууд"
        description="Scene бүрийг засаж, тус тусад нь generate/regenerate хийж болно."
      >
        <div className="cards-grid">
          {detail.scenes.map((scene) => (
            <article key={scene.id} className="scene-card">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <div className="stack-xs">
                  <span className="eyebrow">Scene {scene.scene_index}</span>
                  <strong>{scene.title}</strong>
                </div>
                <StatusPill status={scene.status} />
              </div>

              {scene.previewAssetUrl ? (
                <video
                  controls
                  src={scene.previewAssetUrl}
                  style={{ width: "100%", borderRadius: 18 }}
                />
              ) : null}

              {scene.error_message ? (
                <div className="mini-card stack-xs">
                  <span className="eyebrow">Алдаа</span>
                  <p className="muted-text">{scene.error_message}</p>
                </div>
              ) : null}

              <form className="field-grid" action={saveSceneAction}>
                <input type="hidden" name="projectId" value={detail.project.id} />
                <input type="hidden" name="sceneId" value={scene.id} />
                <label>
                  <span className="field-label">Гарчиг</span>
                  <input className="field" name="title" defaultValue={scene.title} />
                </label>
                <label>
                  <span className="field-label">Narration</span>
                  <textarea
                    className="textarea"
                    name="narration"
                    defaultValue={scene.narration ?? ""}
                  />
                </label>
                <label>
                  <span className="field-label">Visual prompt</span>
                  <textarea
                    className="textarea"
                    name="visualPrompt"
                    defaultValue={scene.visual_prompt ?? ""}
                  />
                </label>
                <label>
                  <span className="field-label">Animation prompt</span>
                  <textarea
                    className="textarea"
                    name="animationPrompt"
                    defaultValue={scene.animation_prompt ?? ""}
                  />
                </label>
                <div className="action-row">
                  <button type="submit" className="button-secondary">
                    Scene хадгалах
                  </button>
                </div>
              </form>

              <form action={queueSceneGenerationAction}>
                <input type="hidden" name="projectId" value={detail.project.id} />
                <input type="hidden" name="sceneId" value={scene.id} />
                <button type="submit" className="button-primary">
                  {scene.clip_url ? "Дахин generate" : "Scene generate"}
                </button>
              </form>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Async jobs"
        description="KIE болон merge job-уудын төлөвийг refresh хийж болно."
      >
        <div className="stack-sm">
          {detail.jobs.length === 0 ? (
            <article className="table-row">
              <p className="muted-text">Одоогоор job үүсээгүй байна.</p>
            </article>
          ) : (
            detail.jobs.map((job) => (
              <article key={job.id} className="table-row">
                <div className="action-row" style={{ justifyContent: "space-between" }}>
                  <strong>{jobTypeLabel(job.job_type)}</strong>
                  <StatusPill status={job.status} />
                </div>
                <div className="key-value">
                  <span>Provider</span>
                  <span>{providerLabel(job.provider)}</span>
                </div>
                <div className="key-value">
                  <span>Provider job ID</span>
                  <span>{job.provider_job_id ?? "-"}</span>
                </div>
                {job.error_message ? (
                  <p className="muted-text">{job.error_message}</p>
                ) : null}
                {job.provider === "kie" &&
                job.provider_job_id &&
                (job.status === "queued" ||
                  job.status === "processing" ||
                  job.status === "retrying") ? (
                  <form action={pollJobAction}>
                    <input type="hidden" name="projectId" value={detail.project.id} />
                    <input type="hidden" name="jobId" value={job.id} />
                    <button type="submit" className="button-ghost">
                      Төлөв шалгах
                    </button>
                  </form>
                ) : null}
              </article>
            ))
          )}
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
