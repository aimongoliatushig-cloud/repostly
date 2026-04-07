import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { FeedbackBanner } from "@/components/feedback-banner";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";
import { listDoctors } from "@/lib/doctors/service";

import {
  createDoctorAction,
  deleteDoctorAction,
  updateDoctorAction,
} from "./actions";

type DoctorsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const params = await searchParams;
  const context = await requireBrandContext("/dashboard/doctors");
  const [brandSettings, doctors] = await Promise.all([
    getBrandSettings(context.supabase, context.brand.id),
    listDoctors(context.supabase, context.brand.id),
  ]);

  return (
    <DashboardShell
      activePath="/dashboard/doctors"
      hospitalName={brandSettings.settings.hospital_name}
      title="Эмч нар"
      description="Эмч нэмэх, үндсэн мэдээлэл шинэчлэх, portrait зураг хадгалах, avatar detail рүү орох удирдлага."
      actions={
        <Link href="/dashboard" className="button-secondary">
          Самбар руу буцах
        </Link>
      }
    >
      {params.error ? <FeedbackBanner tone="error" message={params.error} /> : null}
      {params.message ? (
        <FeedbackBanner tone="success" message={params.message} />
      ) : null}

      <section className="dashboard-split-grid">
        <SectionCard
          title="Эмч нэмэх"
          description="Нэр, мэргэжил, portrait зурагтай шинэ эмч бүртгэнэ."
        >
          <form className="field-grid" action={createDoctorAction}>
            <label>
              <span className="field-label">Нэр</span>
              <input
                className="field"
                name="name_mn"
                placeholder="А. Нарангэрэл"
                required
              />
            </label>
            <label>
              <span className="field-label">Мэргэжил</span>
              <input
                className="field"
                name="specialty_mn"
                placeholder="Дүрс оношилгооны эмч"
                required
              />
            </label>
            <label>
              <span className="field-label">Portrait зураг</span>
              <input
                className="field"
                type="file"
                name="portrait_file"
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
          title="Товч заавар"
          description="Doctor profile ба avatar системийн суурь логик."
        >
          <div className="stack-sm">
            <article className="mini-card stack-xs">
              <strong>Portrait зураг</strong>
              <p className="muted-text">
                Эмчийн үндсэн танилцуулгын зураг. Detail хуудсан дээр avatar
                зурагнуудаас тусдаа харагдана.
              </p>
            </article>
            <article className="mini-card stack-xs">
              <strong>Avatar зураг</strong>
              <p className="muted-text">
                Doctor detail хуудсан дээр олон avatar зураг upload хийж,
                нэгийг нь үндсэн болгож сонгоно.
              </p>
            </article>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Эмчийн жагсаалт"
        description="Inline edit хийж, дэлгэрэнгүй avatar management руу орж, шаардлагагүй эмчийг устгана."
      >
        {doctors.length === 0 ? (
          <div className="empty-state">
            <p className="muted-text">Одоогоор эмч бүртгэгдээгүй байна.</p>
          </div>
        ) : (
          <div className="doctor-grid">
            {doctors.map((doctor) => {
              const coverImage =
                doctor.primaryAvatar?.imageSignedUrl ?? doctor.portraitSignedUrl;

              return (
                <article key={doctor.id} className="doctor-card">
                  <div className="doctor-card-head">
                    <div className="stack-xs">
                      <span className="badge badge-accent">
                        Avatar {doctor.avatarCount}
                      </span>
                      <strong>{doctor.name_mn}</strong>
                      <span className="muted-text">{doctor.specialty_mn}</span>
                    </div>
                    {coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="doctor-thumb"
                        src={coverImage}
                        alt={doctor.name_mn}
                      />
                    ) : (
                      <div className="doctor-thumb doctor-thumb-empty">
                        Зураггүй
                      </div>
                    )}
                  </div>

                  <form className="field-grid" action={updateDoctorAction}>
                    <input type="hidden" name="doctor_id" value={doctor.id} />
                    <input
                      type="hidden"
                      name="returnTo"
                      value="/dashboard/doctors"
                    />
                    <label>
                      <span className="field-label">Нэр</span>
                      <input
                        className="field"
                        name="name_mn"
                        defaultValue={doctor.name_mn}
                        required
                      />
                    </label>
                    <label>
                      <span className="field-label">Мэргэжил</span>
                      <input
                        className="field"
                        name="specialty_mn"
                        defaultValue={doctor.specialty_mn}
                        required
                      />
                    </label>
                    <label>
                      <span className="field-label">Шинэ portrait</span>
                      <input
                        className="field"
                        type="file"
                        name="portrait_file"
                        accept="image/png,image/jpeg,image/webp"
                      />
                    </label>
                    <div className="action-row">
                      <button type="submit" className="button-secondary">
                        Шинэчлэх
                      </button>
                      <Link
                        href={`/dashboard/doctors/${doctor.id}`}
                        className="button-ghost"
                      >
                        Дэлгэрэнгүй
                      </Link>
                    </div>
                  </form>

                  <form action={deleteDoctorAction}>
                    <input type="hidden" name="doctor_id" value={doctor.id} />
                    <button type="submit" className="button-danger">
                      Устгах
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
}
