import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { organAvatars, organScenes } from "@/lib/postly-data";

export default function OrganTalkPage() {
  return (
    <PostlyShell
      activePath="/videos/new/organ-talk"
      eyebrow="Organ студи"
      title="Avatar-driven 40 секундийн organ talk builder"
      description="CTA script дотор ордог, 5 scene continuity-тэй, seed ID-гаар ижил дүр төрхөө хадгалдаг урсгал."
    >
      <section className="grid-2">
        <SectionCard
          title="Avatar сонголт"
          description="Урьдчилан тодорхойлсон organ avatar-аас hook-тэй зохицох дүрийг сонгоно."
        >
          <div className="grid-3">
            {organAvatars.map((avatar) => (
              <article key={avatar.id} className="mini-card stack-sm">
                <div className="action-row" style={{ justifyContent: "space-between" }}>
                  <strong>{avatar.label}</strong>
                  <span className="badge">{avatar.tone}</span>
                </div>
                <p className="muted-text">{avatar.description}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Генерацийн дүрэм"
          description="Organ talk урсгал нь 5 scene, scene бүр 8 секунд, нийт 40 секундээс хэтрэхгүй."
        >
          <div className="stack-sm">
            <article className="table-row">
              <strong>Script generation</strong>
              <p className="muted-text">
                OpenAI нь hook-тэй эхэлсэн, CTA-г дотроо багтаасан Mongolian script гаргана.
              </p>
            </article>
            <article className="table-row">
              <strong>Seed continuity</strong>
              <p className="muted-text">
                KIE scene бүрийг ижил дүр төрхтэй байлгахын тулд seed ID-г scene бүрт хадгална.
              </p>
            </article>
            <article className="table-row">
              <strong>Final merge</strong>
              <p className="muted-text">
                Frame optional, outro optional, гэхдээ CTA-г нэмэлтээр хүчлэхгүй.
              </p>
            </article>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="5 scene storyboard"
        description="Avatar-driven reels-д scene бүр continuity, lip sync, narration, prompt edit action-тай."
      >
        <div className="cards-grid">
          {organScenes.map((scene) => (
            <article key={scene.id} className="scene-card">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <div className="stack-xs">
                  <span className="eyebrow">Scene {scene.order}</span>
                  <strong>{scene.title}</strong>
                </div>
                <StatusPill status={scene.status} />
              </div>
              <div className="key-value">
                <span>Хугацаа</span>
                <span>{scene.durationSeconds} сек</span>
              </div>
              <div className="stack-xs">
                <span className="field-label">Visual prompt</span>
                <p className="muted-text">{scene.visualPrompt}</p>
              </div>
              <div className="stack-xs">
                <span className="field-label">Animation plan</span>
                <p className="muted-text">{scene.animationPrompt}</p>
              </div>
              <div className="stack-xs">
                <span className="field-label">Script мөр</span>
                <p className="muted-text">{scene.narration}</p>
              </div>
              <div className="action-row">
                <button type="button" className="button-ghost">
                  Урьдчилж харах
                </button>
                <button type="button" className="button-secondary">
                  Script засах
                </button>
                <button type="button" className="button-primary">
                  Seed-тэй regenerate
                </button>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
