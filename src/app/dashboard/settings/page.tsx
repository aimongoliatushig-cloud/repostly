import Link from "next/link";

import { AssetPreview } from "@/components/asset-preview";
import { DashboardShell } from "@/components/dashboard-shell";
import { FeedbackBanner } from "@/components/feedback-banner";
import { SectionCard } from "@/components/section-card";
import { requireBrandContext } from "@/lib/auth/context";
import { getBrandSettings } from "@/lib/brands/service";

import { saveBrandSettingsAction } from "./actions";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const params = await searchParams;
  const context = await requireBrandContext("/dashboard/settings");
  const settings = await getBrandSettings(context.supabase, context.brand.id);

  return (
    <DashboardShell
      activePath="/dashboard/settings"
      hospitalName={settings.settings.hospital_name}
      title="Тохиргоо"
      description="Эмнэлгийн нэр, холбоо барих мэдээлэл, logo, frame, outro asset-уудыг эндээс удирдана."
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
          title="Брэндийн мэдээлэл"
          description="Контентын outro болон эмнэлгийн contact хэсэгт ашиглагдах талбарууд."
        >
          <form className="field-grid" action={saveBrandSettingsAction}>
            <label>
              <span className="field-label">Эмнэлгийн нэр</span>
              <input
                className="field"
                name="hospital_name"
                defaultValue={settings.settings.hospital_name}
                required
              />
            </label>
            <label>
              <span className="field-label">Утас</span>
              <input
                className="field"
                name="phone"
                defaultValue={settings.settings.phone ?? ""}
              />
            </label>
            <label>
              <span className="field-label">Вэбсайт</span>
              <input
                className="field"
                name="website"
                defaultValue={settings.settings.website ?? ""}
              />
            </label>
            <label>
              <span className="field-label">Facebook</span>
              <input
                className="field"
                name="facebook"
                defaultValue={settings.settings.facebook ?? ""}
              />
            </label>
            <label>
              <span className="field-label">Хаяг</span>
              <textarea
                className="textarea"
                name="address_mn"
                defaultValue={settings.settings.address_mn ?? ""}
              />
            </label>
            <label>
              <span className="field-label">Logo файл</span>
              <input
                className="field"
                type="file"
                name="logo_file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
              />
            </label>
            <label>
              <span className="field-label">Frame файл</span>
              <input
                className="field"
                type="file"
                name="frame_file"
                accept="image/png,image/webp"
              />
            </label>
            <label>
              <span className="field-label">Outro файл</span>
              <input
                className="field"
                type="file"
                name="outro_file"
                accept="video/mp4,video/quicktime"
              />
            </label>
            <div className="action-row">
              <button type="submit" className="button-primary">
                Тохиргоо хадгалах
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Asset preview"
          description="Одоогоор хадгалагдсан logo, frame, outro файлууд."
        >
          <div className="asset-preview-grid">
            <AssetPreview
              title="Logo"
              url={settings.logoSignedUrl}
              kind="image"
              emptyText="Logo файл хараахан upload хийгдээгүй байна."
            />
            <AssetPreview
              title="Frame"
              url={settings.frameSignedUrl}
              kind="image"
              emptyText="Frame файл хараахан upload хийгдээгүй байна."
            />
            <AssetPreview
              title="Outro"
              url={settings.outroSignedUrl}
              kind="video"
              emptyText="Outro файл хараахан upload хийгдээгүй байна."
            />
          </div>
        </SectionCard>
      </section>
    </DashboardShell>
  );
}
