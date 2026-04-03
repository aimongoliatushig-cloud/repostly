import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { bRollScenes, doctors } from "@/lib/postly-data";

export default function BrollStudioPage() {
  return (
    <PostlyShell
      activePath="/videos/new/broll"
      eyebrow="B-roll студи"
      title="Эмч + MP3 дээр суурилсан 45 секундийн reel builder"
      description="Topic, hook, storyboard, animation plan, clip preview, merge гэсэн алхмуудыг card-by-card засварлаж хурдан гүйлгэнэ."
    >
      <section className="grid-2">
        <SectionCard
          title="Оролтын тохиргоо"
          description="Doctor picker, MP3 upload, credit validation генерац эхлэхээс өмнө хийгдэнэ."
        >
          <div className="field-grid">
            <label>
              <span className="field-label">Эмч сонгох</span>
              <select className="select" defaultValue={doctors[0]?.id}>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName} · {doctor.specialization}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">MP3 audio</span>
              <input className="field" placeholder="doctor-heart-hook.mp3" />
            </label>
            <div className="grid-3">
              <article className="mini-card stack-xs">
                <span className="eyebrow">Лимит</span>
                <strong>45 сек</strong>
              </article>
              <article className="mini-card stack-xs">
                <span className="eyebrow">Кредит шалгалт</span>
                <strong>Амжилттай</strong>
              </article>
              <article className="mini-card stack-xs">
                <span className="eyebrow">Hook</span>
                <strong>Эхний 2 секундэд анхаарал татна</strong>
              </article>
            </div>
            <div className="action-row">
              <button type="button" className="button-primary">
                Topic + storyboard гаргах
              </button>
              <button type="button" className="button-ghost">
                Draft хадгалах
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Merge тохиргоо"
          description="Frame болон outro нь optional. CTA script дотор эсвэл финал outro дээр давхар орж болно."
        >
          <div className="stack-sm">
            <article className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>Frame overlay</strong>
                <StatusPill status="ready" />
              </div>
              <p className="muted-text">PNG frame upload хийгдсэн бол бүх клип дээр автоматаар давхарлана.</p>
            </article>
            <article className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>Outro video</strong>
                <StatusPill status="editable" />
              </div>
              <p className="muted-text">Optional outro-г merge шатанд залгана.</p>
            </article>
            <article className="table-row">
              <strong>Preview loop</strong>
              <p className="muted-text">
                Scene бүр дээр play, prompt edit, regenerate action тусдаа байдаг тул бүх видео дахин render хийхгүй.
              </p>
            </article>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="7 scene storyboard"
        description="OpenAI-оор гарсан scene картуудыг B-roll preview generation-ий өмнө чөлөөтэй засварлана."
      >
        <div className="cards-grid">
          {bRollScenes.map((scene) => (
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
                <span className="field-label">Narration</span>
                <p className="muted-text">{scene.narration}</p>
              </div>
              <div className="action-row">
                <button type="button" className="button-ghost">
                  Клип тоглуулах
                </button>
                <button type="button" className="button-secondary">
                  Prompt засах
                </button>
                <button type="button" className="button-primary">
                  Дахин generate
                </button>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
