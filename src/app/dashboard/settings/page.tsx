import Link from "next/link";

import { FeedbackBanner } from "@/components/feedback-banner";
import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";

import { saveBrandSettingsAction } from "../actions";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const context = await requireBrandContext("/dashboard/settings");
  const settings = await getBrandSettings(context.supabase, context.brand.id);

  return (
    <PostlyShell
      activePath="/dashboard/settings"
      eyebrow="Брэнд тохиргоо"
      title="Брэндийн contact ба asset удирдлага"
      description="Logo, frame PNG, outro video, Facebook, website, хаяг зэрэг бүх финал reel-д нөлөөлөх мэдээлэл энд хадгалагдана."
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
          title="Брэндийн мэдээлэл"
          description="CTA, overlay, landing redirect дээр ашиглагдах үндсэн талбарууд."
        >
          <form className="field-grid" action={saveBrandSettingsAction}>
            <label>
              <span className="field-label">Брэндийн нэр</span>
              <input className="field" name="name" defaultValue={settings.brand.name} />
            </label>
            <label>
              <span className="field-label">Утас</span>
              <input
                className="field"
                name="phone"
                defaultValue={settings.brand.phone ?? ""}
              />
            </label>
            <label>
              <span className="field-label">Website</span>
              <input
                className="field"
                name="website"
                defaultValue={settings.brand.website ?? ""}
              />
            </label>
            <label>
              <span className="field-label">Facebook URL</span>
              <input
                className="field"
                name="facebookUrl"
                defaultValue={settings.brand.facebook_url ?? ""}
              />
            </label>
            <label>
              <span className="field-label">Хаяг</span>
              <textarea
                className="textarea"
                name="address"
                defaultValue={settings.brand.address ?? ""}
              />
            </label>
            <label>
              <span className="field-label">Logo</span>
              <input
                className="field"
                name="logoFile"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
              />
            </label>
            <label>
              <span className="field-label">Frame PNG</span>
              <input
                className="field"
                name="frameFile"
                type="file"
                accept="image/png,image/webp"
              />
            </label>
            <label>
              <span className="field-label">Outro video</span>
              <input
                className="field"
                name="outroFile"
                type="file"
                accept="video/mp4,video/quicktime"
              />
            </label>
            <div className="action-row">
              <button type="submit" className="button-primary">
                Өөрчлөлт хадгалах
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Одоогийн asset preview"
          description="Merge шатанд frame/outro-г optional ашиглана."
        >
          <div className="stack-sm">
            <article className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>Logo</strong>
                <span className="badge">{settings.logoUrl ? "Бэлэн" : "Алга"}</span>
              </div>
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt="Брэндийн logo"
                  style={{ maxWidth: "100%", borderRadius: 18 }}
                />
              ) : (
                <p className="muted-text">Logo хараахан upload хийгдээгүй байна.</p>
              )}
            </article>
            <article className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>Frame</strong>
                <span className="badge">{settings.frameUrl ? "Бэлэн" : "Алга"}</span>
              </div>
              {settings.frameUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.frameUrl}
                  alt="Frame preview"
                  style={{ maxWidth: "100%", borderRadius: 18 }}
                />
              ) : (
                <p className="muted-text">Frame overlay upload хийгдээгүй байна.</p>
              )}
            </article>
            <article className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>Outro</strong>
                <span className="badge">
                  {settings.outroUrl ? "Бэлэн" : "Алга"}
                </span>
              </div>
              {settings.outroUrl ? (
                <video
                  controls
                  src={settings.outroUrl}
                  style={{ width: "100%", borderRadius: 18 }}
                />
              ) : (
                <p className="muted-text">Outro video upload хийгдээгүй байна.</p>
              )}
            </article>
          </div>
        </SectionCard>
      </section>
    </PostlyShell>
  );
}
