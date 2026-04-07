import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { FeedbackBanner } from "@/components/feedback-banner";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";
import { getDoctorDetail } from "@/lib/doctors/service";

import {
  setPrimaryAvatarAction,
  updateDoctorAction,
  uploadDoctorAvatarAction,
} from "../actions";

type DoctorDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DoctorDetailPage({
  params,
  searchParams,
}: DoctorDetailPageProps) {
  const routeParams = await params;
  const query = await searchParams;
  const context = await requireBrandContext(
    `/dashboard/doctors/${routeParams.id}`,
  );
  const detail = await getDoctorDetail(context.supabase, {
    brandId: context.brand.id,
    doctorId: routeParams.id,
  }).catch(() => notFound());

  const brandSettings = await getBrandSettings(context.supabase, context.brand.id);

  return (
    <DashboardShell
      activePath="/dashboard/doctors"
      hospitalName={brandSettings.settings.hospital_name}
      title={detail.doctor.name_mn}
      description="Эмчийн үндсэн мэдээлэл, portrait зураг, avatar сангийн дэлгэрэнгүй удирдлага."
      actions={
        <Link href="/dashboard/doctors" className="button-secondary">
          Жагсаалт руу буцах
        </Link>
      }
    >
      {query.error ? <FeedbackBanner tone="error" message={query.error} /> : null}
      {query.message ? (
        <FeedbackBanner tone="success" message={query.message} />
      ) : null}

      <SectionCard
        title="Эмчийн мэдээлэл"
        description="Нэр, мэргэжил, portrait зураг энд шинэчлэгдэнэ."
      >
        <div className="dashboard-split-grid">
          <form className="field-grid" action={updateDoctorAction}>
            <input type="hidden" name="doctor_id" value={detail.doctor.id} />
            <input
              type="hidden"
              name="returnTo"
              value={`/dashboard/doctors/${detail.doctor.id}`}
            />
            <label>
              <span className="field-label">Нэр</span>
              <input
                className="field"
                name="name_mn"
                defaultValue={detail.doctor.name_mn}
                required
              />
            </label>
            <label>
              <span className="field-label">Мэргэжил</span>
              <input
                className="field"
                name="specialty_mn"
                defaultValue={detail.doctor.specialty_mn}
                required
              />
            </label>
            <label>
              <span className="field-label">Шинэ portrait зураг</span>
              <input
                className="field"
                type="file"
                name="portrait_file"
                accept="image/png,image/jpeg,image/webp"
              />
            </label>
            <div className="action-row">
              <button type="submit" className="button-primary">
                Мэдээлэл шинэчлэх
              </button>
            </div>
          </form>

          <div className="stack-sm">
            <div className="mini-card stack-xs">
              <strong>Одоогийн portrait</strong>
              {detail.portraitSignedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="doctor-portrait-large"
                  src={detail.portraitSignedUrl}
                  alt={detail.doctor.name_mn}
                />
              ) : (
                <div className="empty-state">
                  <p className="muted-text">Portrait зураг оруулаагүй байна.</p>
                </div>
              )}
            </div>
            <div className="mini-card stack-xs">
              <strong>Үндсэн avatar</strong>
              {detail.primaryAvatar?.imageSignedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="doctor-portrait-large"
                  src={detail.primaryAvatar.imageSignedUrl}
                  alt="Үндсэн avatar"
                />
              ) : (
                <p className="muted-text">Үндсэн avatar сонгогдоогүй байна.</p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <section className="dashboard-split-grid">
        <SectionCard
          title="Шинэ avatar зураг"
          description="Энэ эмч дээр нэмэлт avatar зураг upload хийж болно."
        >
          <form className="field-grid" action={uploadDoctorAvatarAction}>
            <input type="hidden" name="doctor_id" value={detail.doctor.id} />
            <input
              type="hidden"
              name="returnTo"
              value={`/dashboard/doctors/${detail.doctor.id}`}
            />
            <label>
              <span className="field-label">Avatar зураг</span>
              <input
                className="field"
                type="file"
                name="avatar_file"
                accept="image/png,image/jpeg,image/webp"
                required
              />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" name="is_primary" />
              <span>Шууд үндсэн avatar болгох</span>
            </label>
            <div className="action-row">
              <button type="submit" className="button-primary">
                Avatar хадгалах
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Avatar статистик"
          description="Doctor detail дээрх avatar сангийн товч мэдээлэл."
        >
          <div className="stack-sm">
            <div className="key-value">
              <span>Нийт avatar</span>
              <strong>{detail.avatars.length}</strong>
            </div>
            <div className="key-value">
              <span>Үндсэн зураг</span>
              <strong>{detail.primaryAvatar ? "Сонгосон" : "Алга"}</strong>
            </div>
            <div className="key-value">
              <span>Portrait зураг</span>
              <strong>{detail.portraitSignedUrl ? "Байгаа" : "Алга"}</strong>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Avatar жагсаалт"
        description="Нэг doctor дээр олон avatar зураг хадгалж, аль нэгийг нь үндсэн болгоно."
      >
        {detail.avatars.length === 0 ? (
          <div className="empty-state">
            <p className="muted-text">Avatar зураг хараахан нэмэгдээгүй байна.</p>
          </div>
        ) : (
          <div className="avatar-grid">
            {detail.avatars.map((avatar) => (
              <article key={avatar.id} className="avatar-card">
                {avatar.imageSignedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="avatar-image"
                    src={avatar.imageSignedUrl}
                    alt={`${detail.doctor.name_mn} avatar`}
                  />
                ) : null}
                <div className="stack-xs">
                  <span className={avatar.is_primary ? "badge badge-accent" : "badge"}>
                    {avatar.is_primary ? "Үндсэн avatar" : "Нэмэлт avatar"}
                  </span>
                  <span className="muted-text">
                    {new Intl.DateTimeFormat("mn-MN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(avatar.created_at))}
                  </span>
                </div>
                {!avatar.is_primary ? (
                  <form action={setPrimaryAvatarAction}>
                    <input type="hidden" name="doctor_id" value={detail.doctor.id} />
                    <input type="hidden" name="avatar_id" value={avatar.id} />
                    <input
                      type="hidden"
                      name="returnTo"
                      value={`/dashboard/doctors/${detail.doctor.id}`}
                    />
                    <button type="submit" className="button-secondary button-block">
                      Үндсэн болгох
                    </button>
                  </form>
                ) : (
                  <div className="button-ghost button-block">Сонгогдсон</div>
                )}
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
}
