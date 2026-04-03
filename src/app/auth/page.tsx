import Link from "next/link";

import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";

export default function AuthPage() {
  return (
    <PostlyShell
      activePath="/auth"
      eyebrow="Нэвтрэлт"
      title="Брэнд суурьтай нэвтрэлт ба бүртгэл"
      description="Admin, brand, agent гэсэн 3 төрлийн role-ийг Supabase Auth дээр суурилан удирдах auth experience."
      actions={
        <>
          <Link href="/dashboard" className="button-primary">
            Демо самбар руу
          </Link>
          <Link href="/" className="button-ghost">
            Архитектур руу буцах
          </Link>
        </>
      }
    >
      <section className="grid-2">
        <SectionCard
          title="Нэвтрэх"
          description="Brand эсвэл agent хэрэглэгч default brand context-тайгаа session авна."
        >
          <form className="field-grid">
            <label>
              <span className="field-label">Имэйл эсвэл утас</span>
              <input className="field" placeholder="clinic@postly.mn" />
            </label>
            <label>
              <span className="field-label">Нууц үг</span>
              <input className="field" type="password" placeholder="••••••••" />
            </label>
            <label>
              <span className="field-label">Идэвхтэй брэнд</span>
              <select className="select" defaultValue="sergeen">
                <option value="sergeen">Сэргээн Клиник</option>
                <option value="enerel">Энэрэл эмнэлэг</option>
              </select>
            </label>
            <div className="action-row">
              <button type="button" className="button-primary">
                Нэвтрэх
              </button>
              <button type="button" className="button-ghost">
                Нууц үг сэргээх
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Бүртгүүлэх"
          description="Шинэ brand account үүсэхэд initial membership ба subscription scaffold автоматаар бэлтгэгдэнэ."
        >
          <form className="field-grid">
            <label>
              <span className="field-label">Брэндийн нэр</span>
              <input className="field" placeholder="Сэргээн Клиник" />
            </label>
            <label>
              <span className="field-label">Холбоо барих утас</span>
              <input className="field" placeholder="7707-1100" />
            </label>
            <label>
              <span className="field-label">Имэйл</span>
              <input className="field" placeholder="marketing@clinic.mn" />
            </label>
            <label>
              <span className="field-label">Нууц үг</span>
              <input className="field" type="password" placeholder="Хамгийн багадаа 8 тэмдэгт" />
            </label>
            <div className="action-row">
              <button type="button" className="button-primary">
                Бүртгэл үүсгэх
              </button>
              <button type="button" className="button-secondary">
                Агент урилга илгээх
              </button>
            </div>
          </form>
        </SectionCard>
      </section>

      <SectionCard
        title="Role matrix"
        description="Нэг хэрэглэгч олон брэндтэй membership-ээр холбогдож болно."
      >
        <div className="grid-3">
          <article className="mini-card stack-sm">
            <strong>Admin</strong>
            <p className="muted-text">
              Бүх брэнд, эмчийн сан, plan, credit adjustment, queue visibility бүрэн нээлттэй.
            </p>
          </article>
          <article className="mini-card stack-sm">
            <strong>Brand</strong>
            <p className="muted-text">
              Өөрийн эмч, brand settings, видео төсөл, download, billing summary-г удирдана.
            </p>
          </article>
          <article className="mini-card stack-sm">
            <strong>Agent</strong>
            <p className="muted-text">
              Brand-тай ижил studio access авч, контент үйлдвэрлэл хийдэг ч ихэнхдээ billing edit хийхгүй.
            </p>
          </article>
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
