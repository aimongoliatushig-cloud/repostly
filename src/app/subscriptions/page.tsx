import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { formatMnt, subscriptionPlans } from "@/lib/postly-data";

const ledger = [
  {
    title: "Сарын renewal",
    delta: "+10",
    helper: "Өсөлтийн багц автоматаар идэвхжив",
  },
  {
    title: "Зүрх өвдөхөд анзаарах 3 дохио",
    delta: "-1",
    helper: "Final video амжилттай merge хийгдэж credit хасагдсан",
  },
  {
    title: "Элэг яагаад өвддөг вэ?",
    delta: "-1",
    helper: "Organ talk completed болсон",
  },
];

export default function SubscriptionsPage() {
  return (
    <PostlyShell
      activePath="/subscriptions"
      eyebrow="Багц ба төлбөр"
      title="Багц, кредит, хэрэглээний ил тод лог"
      description="Completed видео бүр 1 кредит. Хэрэглэгч төлөвлөлтөө dashboard-аас, санхүүгийн зураглалаа энэ page-ээс харна."
    >
      <SectionCard
        title="Идэвхтэй subscription"
        description="Сэргээн Клиник одоогоор Өсөлтийн багц дээр явж байна."
      >
        <div className="grid-3">
          <article className="metric-card">
            <p className="eyebrow">Одоогийн багц</p>
            <p className="metric-value">10 кредит</p>
            <p className="metric-helper">{formatMnt(560000)}</p>
          </article>
          <article className="metric-card">
            <p className="eyebrow">Үлдэгдэл</p>
            <p className="metric-value">8</p>
            <p className="metric-helper">2 видео дууссан тул 2 кредит хасагдсан</p>
          </article>
          <article className="metric-card">
            <p className="eyebrow">Дараагийн renewal</p>
            <p className="metric-value">2026.05.03</p>
            <p className="metric-helper">Auto renew идэвхтэй</p>
          </article>
        </div>
      </SectionCard>

      <SectionCard
        title="Багцын шатлал"
        description="Hospital болон agent workload-д тохирсон кредитийн түвшин."
      >
        <div className="grid-4">
          {subscriptionPlans.map((plan) => (
            <article key={plan.id} className="panel-card stack-sm">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>{plan.label}</strong>
                {plan.recommended ? (
                  <span className="badge badge-accent">Хамгийн түгээмэл</span>
                ) : null}
              </div>
              <p className="metric-value">{plan.credits}</p>
              <p className="muted-text">{formatMnt(plan.priceMnt)}</p>
              <p className="muted-text">{plan.description}</p>
              <button type="button" className="button-secondary">
                Энэ багц руу шинэчлэх
              </button>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Кредитийн хөдөлгөөн"
        description="Billing audit trail нь brand support ба admin review-д шууд ашиглагдана."
      >
        <div className="stack-sm">
          {ledger.map((entry) => (
            <article key={entry.title} className="table-row">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>{entry.title}</strong>
                <span className={entry.delta.startsWith("+") ? "status-pill status-ready" : "status-pill status-rendering"}>
                  {entry.delta}
                </span>
              </div>
              <p className="muted-text">{entry.helper}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </PostlyShell>
  );
}
