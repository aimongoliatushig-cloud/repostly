import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { brandSettings } from "@/lib/postly-data";

export default function BrandSettingsPage() {
  return (
    <PostlyShell
      activePath="/settings/brand"
      eyebrow="Брэнд тохиргоо"
      title="Брэндийн контакт ба visual asset удирдлага"
      description="Logo, frame PNG, outro video, Facebook, website, address зэрэг бүх финал reel-д нөлөөлөх assets энд төвлөрнө."
    >
      <section className="grid-2">
        <SectionCard
          title="Брэндийн мэдээлэл"
          description="Contact fields нь CTA, overlay, landing redirect дээр ашиглагдана."
        >
          <form className="field-grid">
            <label>
              <span className="field-label">Брэндийн нэр</span>
              <input className="field" defaultValue={brandSettings.name} />
            </label>
            <label>
              <span className="field-label">Утас</span>
              <input className="field" defaultValue={brandSettings.phone} />
            </label>
            <label>
              <span className="field-label">Website</span>
              <input className="field" defaultValue={brandSettings.website} />
            </label>
            <label>
              <span className="field-label">Facebook</span>
              <input className="field" defaultValue={brandSettings.facebook} />
            </label>
            <label>
              <span className="field-label">Хаяг</span>
              <textarea className="textarea" defaultValue={brandSettings.address} />
            </label>
            <button type="button" className="button-primary">
              Өөрчлөлт хадгалах
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Upload assets"
          description="Frame болон outro-г optional ашиглах тул version history-тэйгээр хадгална."
        >
          <div className="stack-sm">
            <article className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>Logo</strong>
                <span className="badge badge-accent">{brandSettings.logoStatus}</span>
              </div>
              <p className="muted-text">PNG эсвэл SVG brand mark. Dashboard болон финал CTA дээр харагдана.</p>
            </article>
            <article className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>Frame</strong>
                <span className="badge badge-accent">{brandSettings.frameStatus}</span>
              </div>
              <p className="muted-text">1080x1920 transparent overlay. Reel бүрийн дээр optional нэмэгдэнэ.</p>
            </article>
            <article className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>Outro</strong>
                <span className="badge">{brandSettings.outroStatus}</span>
              </div>
              <p className="muted-text">CTA-г хүчлэхгүй. Зөвхөн brand хүсвэл merge шатанд залгана.</p>
            </article>
          </div>
        </SectionCard>
      </section>
    </PostlyShell>
  );
}
