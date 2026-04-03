import Link from "next/link";

import { FeedbackBanner } from "@/components/feedback-banner";
import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";

import { createOrganProjectAction } from "../actions";

type OrganPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function OrganPage({ searchParams }: OrganPageProps) {
  const params = await searchParams;
  const context = await requireBrandContext("/dashboard/organ");
  const { data: organs, error } = await context.supabase
    .from("organ_avatars")
    .select("*")
    .eq("is_active", true)
    .order("label", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    <PostlyShell
      activePath="/dashboard/organ"
      eyebrow="Organ студи"
      title="Organ talk төсөл эхлүүлэх"
      description="Орган avatar сонгоод 5 x 8 секундийн continuity-тэй storyboard үүсгэнэ."
      actions={
        <>
          <Link href="/dashboard/projects" className="button-secondary">
            Төслүүд рүү
          </Link>
          <Link href="/dashboard" className="button-ghost">
            Самбар руу буцах
          </Link>
        </>
      }
    >
      {params.error ? <FeedbackBanner tone="error" message={params.error} /> : null}
      {params.message ? (
        <FeedbackBanner tone="success" message={params.message} />
      ) : null}

      <section className="grid-2">
        <SectionCard
          title="Avatar сонголт"
          description="Organ talk workflow нь hook, script, continuity бүхий 5 сегменттэй."
        >
          <form className="field-grid" action={createOrganProjectAction}>
            <label>
              <span className="field-label">Төслийн гарчиг</span>
              <input
                className="field"
                name="title"
                placeholder="Элэг яагаад ачаалалд ордог вэ?"
              />
            </label>
            <label>
              <span className="field-label">Орган avatar</span>
              <select className="select" name="organAvatarId" required>
                <option value="">Орган сонгоно уу</option>
                {(organs ?? []).map((organ) => (
                  <option key={organ.id} value={organ.id}>
                    {organ.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid-2">
              <label className="mini-card stack-xs">
                <span className="field-label">Frame overlay</span>
                <input type="checkbox" name="applyFrame" />
                <span className="muted-text">Финал merge дээр frame нэмэх</span>
              </label>
              <label className="mini-card stack-xs">
                <span className="field-label">Outro video</span>
                <input type="checkbox" name="applyOutro" />
                <span className="muted-text">Хэрэв хүсвэл outro нэмнэ</span>
              </label>
            </div>
            <div className="action-row">
              <button type="submit" className="button-primary">
                5 scene storyboard үүсгэх
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Workflow дүрэм"
          description="Орган talk нь нийт 40 секундээс хэтрэхгүй, CTA-г script дотор шингээж болно."
        >
          <div className="stack-sm">
            <article className="table-row">
              <strong>Scene бүтэц</strong>
              <p className="muted-text">5 segment × 8 секунд</p>
            </article>
            <article className="table-row">
              <strong>Continuity</strong>
              <p className="muted-text">
                Нэг дүр төрхийг хадгалахын тулд seed continuity талбар scene бүрт
                хадгалагдана.
              </p>
            </article>
            <article className="table-row">
              <strong>Кредит</strong>
              <p className="muted-text">
                Одоо үлдсэн кредит: {context.subscription?.remaining_credits ?? 0}
              </p>
            </article>
          </div>
        </SectionCard>
      </section>
    </PostlyShell>
  );
}
