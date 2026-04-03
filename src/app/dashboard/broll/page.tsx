import Link from "next/link";

import { FeedbackBanner } from "@/components/feedback-banner";
import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { listDoctors } from "@/lib/doctors/service";

import { createBrollProjectAction } from "../actions";

type BrollPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function BrollPage({ searchParams }: BrollPageProps) {
  const params = await searchParams;
  const context = await requireBrandContext("/dashboard/broll");
  const doctors = await listDoctors(context.supabase, context.brand.id);

  return (
    <PostlyShell
      activePath="/dashboard/broll"
      eyebrow="B-roll студи"
      title="Эмч + MP3 дээр суурилсан reel төсөл эхлүүлэх"
      description="Эмч сонголт, MP3 upload, frame/outro тохиргоо, кредит шалгалтыг нэг формоор хийнэ."
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
          title="Оролтын тохиргоо"
          description="Doctor portrait болон MP3 аудиог ашиглан OpenAI storyboard бэлтгэнэ."
        >
          <form className="field-grid" action={createBrollProjectAction}>
            <label>
              <span className="field-label">Төслийн гарчиг</span>
              <input
                className="field"
                name="title"
                placeholder="Зүрхний эрсдэлийн дохио"
              />
            </label>
            <label>
              <span className="field-label">Эмч сонгох</span>
              <select className="select" name="doctorId" required>
                <option value="">Эмч сонгоно уу</option>
                {doctors
                  .filter((doctor) => doctor.is_active)
                  .map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name} · {doctor.specialization}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span className="field-label">Эмчийн MP3 аудио</span>
              <input
                className="field"
                name="audioFile"
                type="file"
                accept="audio/mpeg"
                required
              />
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
                <span className="muted-text">Brand outro-г нэмэх</span>
              </label>
            </div>
            <div className="action-row">
              <button type="submit" className="button-primary">
                Storyboard үүсгэх
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Генерацийн дүрэм"
          description="B-roll workflow нь эмчийн толгой дүрийг хадгалсан, card-based storyboard review-тэй."
        >
          <div className="stack-sm">
            <article className="table-row">
              <strong>Хугацааны лимит</strong>
              <p className="muted-text">Нийт 45 секундээс хэтрэхгүй байна.</p>
            </article>
            <article className="table-row">
              <strong>Storyboard</strong>
              <p className="muted-text">
                OpenAI planning-аар 7 хүртэлх scene карт үүсч, дараа нь та гараар
                засварлана.
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
