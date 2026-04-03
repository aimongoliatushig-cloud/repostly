import Link from "next/link";

import { FeedbackBanner } from "@/components/feedback-banner";
import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";

type AuthPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const nextPath = params.next || "/dashboard";

  return (
    <PostlyShell
      activePath="/auth"
      eyebrow="Нэвтрэлт"
      title="Брэнд суурьтай нэвтрэлт ба бүртгэл"
      description="Admin, brand, agent хэрэглэгчид Supabase Auth дээр суурилан нэвтэрч, өөрийн брэнд context-оо автоматаар авна."
      actions={
        <>
          <Link href="/" className="button-secondary">
            Нүүр хуудас
          </Link>
          <a href="#register-form" className="button-primary">
            Шинээр бүртгүүлэх
          </a>
        </>
      }
    >
      {params.error ? <FeedbackBanner tone="error" message={params.error} /> : null}
      {params.message ? (
        <FeedbackBanner tone="success" message={params.message} />
      ) : null}

      <section className="grid-2">
        <SectionCard
          title="Нэвтрэх"
          description="Идэвхтэй хэрэглэгч имэйл, нууц үгээрээ орж dashboard руу үргэлжилнэ."
        >
          <form className="field-grid" method="post" action="/api/auth/login">
            <input type="hidden" name="next" value={nextPath} />
            <label>
              <span className="field-label">Имэйл</span>
              <input
                className="field"
                name="emailOrPhone"
                type="email"
                placeholder="clinic@postly.mn"
                required
              />
            </label>
            <label>
              <span className="field-label">Нууц үг</span>
              <input
                className="field"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </label>
            <div className="action-row">
              <button type="submit" className="button-primary">
                Нэвтрэх
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Бүртгүүлэх"
          description="Шинэ брэнд үүсэхэд анхны багц, membership, subscription context автоматаар үүснэ."
        >
          <form
            id="register-form"
            className="field-grid"
            method="post"
            action="/api/auth/register"
          >
            <input type="hidden" name="next" value={nextPath} />
            <label>
              <span className="field-label">Брэндийн нэр</span>
              <input
                className="field"
                name="brandName"
                placeholder="Сэргээн Клиник"
                required
              />
            </label>
            <label>
              <span className="field-label">Холбоо барих утас</span>
              <input className="field" name="phone" placeholder="7707-1100" />
            </label>
            <label>
              <span className="field-label">Имэйл</span>
              <input
                className="field"
                name="email"
                type="email"
                placeholder="marketing@clinic.mn"
                required
              />
            </label>
            <label>
              <span className="field-label">Нууц үг</span>
              <input
                className="field"
                name="password"
                type="password"
                minLength={8}
                placeholder="Хамгийн багадаа 8 тэмдэгт"
                required
              />
            </label>
            <div className="action-row">
              <button type="submit" className="button-primary">
                Бүртгэл үүсгэх
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
              Бүх брэнд, эмчийн сан, багц, кредитийн хөдөлгөөн, queue төлөвийг
              бүхэлд нь удирдана.
            </p>
          </article>
          <article className="mini-card stack-sm">
            <strong>Brand</strong>
            <p className="muted-text">
              Өөрийн брэндийн эмч, asset, төсөл, storyboard, final download-г
              удирдана.
            </p>
          </article>
          <article className="mini-card stack-sm">
            <strong>Agent</strong>
            <p className="muted-text">
              Brand-тай ижил үйлдвэрлэлийн access авч, контент урсгалыг
              ажиллуулна.
            </p>
          </article>
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
