import Link from "next/link";

import { FeedbackBanner } from "@/components/feedback-banner";
import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { listDoctors } from "@/lib/doctors/service";

import {
  archiveDoctorAction,
  createDoctorAction,
  updateDoctorAction,
} from "../actions";

type DoctorsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const params = await searchParams;
  const context = await requireBrandContext("/dashboard/doctors");
  const doctors = await listDoctors(context.supabase, context.brand.id);

  return (
    <PostlyShell
      activePath="/dashboard/doctors"
      eyebrow="Эмчийн сан"
      title="Эмчийн сан ба мэргэжлийн удирдлага"
      description="Brand context дотор эмч нэмэх, portrait upload хийх, мэдээлэл шинэчлэх, архивлах боломжтой."
      actions={
        <>
          <Link href="/dashboard/broll" className="button-primary">
            B-roll үүсгэх
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
          title="Шинэ эмч нэмэх"
          description="Эмчийн нэр, мэргэжил, portrait зураг нэг дор хадгалагдана."
        >
          <form className="field-grid" action={createDoctorAction}>
            <label>
              <span className="field-label">Эмчийн нэр</span>
              <input
                className="field"
                name="fullName"
                placeholder="О. Наранцацрал"
                required
              />
            </label>
            <label>
              <span className="field-label">Мэргэжил</span>
              <input
                className="field"
                name="specialization"
                placeholder="Уушгины эмч"
                required
              />
            </label>
            <label>
              <span className="field-label">Portrait зураг</span>
              <input
                className="field"
                name="imageFile"
                type="file"
                accept="image/png,image/jpeg,image/webp"
              />
            </label>
            <div className="action-row">
              <button type="submit" className="button-primary">
                Эмч хадгалах
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Хэрэглээний note"
          description="B-roll topic suggestion болон doctor picker дээр энэ санг ашиглана."
        >
          <div className="stack-sm">
            <article className="table-row">
              <strong>Portrait чанар</strong>
              <p className="muted-text">
                Цэвэр background-тай зураг байх тусам doctor overlay илүү цэвэр
                харагдана.
              </p>
            </article>
            <article className="table-row">
              <strong>Мэргэжлийн шошго</strong>
              <p className="muted-text">
                OpenAI planning prompt дээр specialization context хэлбэрээр
                орно.
              </p>
            </article>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Одоогийн эмч нар"
        description="Inline edit хийж, шаардлагагүй эмчийг архивлаж болно."
      >
        <div className="cards-grid">
          {doctors.length === 0 ? (
            <article className="table-row">
              <p className="muted-text">Одоогоор эмч бүртгэгдээгүй байна.</p>
            </article>
          ) : (
            doctors.map((doctor) => (
              <article key={doctor.id} className="scene-card">
                <div
                  className="action-row"
                  style={{ justifyContent: "space-between", alignItems: "flex-start" }}
                >
                  <div className="stack-xs">
                    <span className="eyebrow">
                      {doctor.is_active ? "Идэвхтэй" : "Архивласан"}
                    </span>
                    <strong>{doctor.full_name}</strong>
                    <span className="muted-text">{doctor.specialization}</span>
                  </div>
                  {doctor.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.full_name}
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 18,
                      }}
                    />
                  ) : null}
                </div>

                <form className="field-grid" action={updateDoctorAction}>
                  <input type="hidden" name="doctorId" value={doctor.id} />
                  <label>
                    <span className="field-label">Нэр</span>
                    <input
                      className="field"
                      name="fullName"
                      defaultValue={doctor.full_name}
                      required
                    />
                  </label>
                  <label>
                    <span className="field-label">Мэргэжил</span>
                    <input
                      className="field"
                      name="specialization"
                      defaultValue={doctor.specialization}
                      required
                    />
                  </label>
                  <label>
                    <span className="field-label">Шинэ зураг</span>
                    <input
                      className="field"
                      name="imageFile"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                    />
                  </label>
                  <div className="action-row">
                    <button type="submit" className="button-secondary">
                      Шинэчлэх
                    </button>
                  </div>
                </form>

                {doctor.is_active ? (
                  <form action={archiveDoctorAction}>
                    <input type="hidden" name="doctorId" value={doctor.id} />
                    <button type="submit" className="button-ghost">
                      Архивлах
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
