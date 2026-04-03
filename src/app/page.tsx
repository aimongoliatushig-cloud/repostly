import Link from "next/link";

import { PostlyShell } from "@/components/postly-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import {
  apiGroups,
  bRollFlow,
  dashboardMetrics,
  databaseSections,
  formatMnt,
  organTalkFlow,
  subscriptionPlans,
  uiPages,
} from "@/lib/postly-data";
import { getIntegrationStatuses } from "@/lib/env";

export default function Home() {
  const integrations = getIntegrationStatuses();

  return (
    <PostlyShell
      activePath="/"
      eyebrow="Schema -> API -> UI"
      title="Эмнэлгийн AI video production платформын суурь"
      description="Postly AI нь hospital, clinic, agent багуудад Монгол хэл дээр viral-ready reel хурдан үйлдвэрлэх production-ready SaaS суурь өгнө."
      actions={
        <>
          <Link href="/dashboard" className="button-primary">
            Хяналтын самбар нээх
          </Link>
          <Link href="/api/pipeline" className="button-ghost">
            API зураглал харах
          </Link>
        </>
      }
    >
      <section className="grid-4">
        {dashboardMetrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <p className="eyebrow">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className="metric-helper">{metric.helper}</p>
          </article>
        ))}
      </section>

      <SectionCard
        title="Интеграцийн бэлэн байдал"
        description="OpenAI, KIE.ai, Supabase холболтын environment түлхүүрүүдийг эндээс шалгана."
      >
        <div className="grid-3">
          {integrations.map((item) => (
            <article key={item.key} className="mini-card stack-sm">
              <div className="action-row" style={{ justifyContent: "space-between" }}>
                <strong>{item.label}</strong>
                <StatusPill status={item.configured ? "completed" : "draft"} />
              </div>
              <p className="muted-text">{item.hint}</p>
              <span className="code-link">{item.key}</span>
            </article>
          ))}
        </div>
      </SectionCard>

      <section className="cards-grid">
        <SectionCard
          title="Supabase schema"
          description="Brand-centered access model, queue storage, billing ledger бүхий өгөгдлийн загвар."
        >
          <div className="stack-md">
            {databaseSections.map((section) => (
              <article key={section.title} className="panel-card stack-sm">
                <div className="stack-xs">
                  <h2 className="card-title">{section.title}</h2>
                  <p className="muted-text">{section.description}</p>
                </div>
                <div className="stack-sm">
                  {section.tables.map((table) => (
                    <div key={table.name} className="table-row">
                      <div className="action-row" style={{ justifyContent: "space-between" }}>
                        <strong>{table.name}</strong>
                        <span className="badge">{table.columns.length} багана</span>
                      </div>
                      <p className="muted-text">{table.purpose}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="API modules"
          description="OpenAI planning, KIE rendering, brand settings, queue tracking-ийг модульчилсан route group-уудаар төлөвлөв."
        >
          <div className="stack-md">
            {apiGroups.map((group) => (
              <article key={group.title} className="panel-card stack-sm">
                <div className="stack-xs">
                  <h2 className="card-title">{group.title}</h2>
                  <p className="muted-text">{group.description}</p>
                </div>
                <div className="stack-sm">
                  {group.routes.map((route) => (
                    <div key={route.path} className="table-row">
                      <div className="action-row" style={{ justifyContent: "space-between" }}>
                        <strong>{route.title}</strong>
                        <span className="badge">
                          {route.method} {route.path}
                        </span>
                      </div>
                      <p className="muted-text">{route.purpose}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid-2">
        <SectionCard
          title="B-roll урсгал"
          description="Эмч сонголт, MP3 upload, 7 scene storyboard, clip preview, merge."
        >
          <ol className="list-clean">
            {bRollFlow.map((step, index) => (
              <li key={step}>
                <span className="step-index">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          title="Organ talk урсгал"
          description="Avatar-driven script, 5 scene continuity, seed ID ашигласан KIE clips."
        >
          <ol className="list-clean">
            {organTalkFlow.map((step, index) => (
              <li key={step}>
                <span className="step-index">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      </section>

      <section className="grid-2">
        <SectionCard
          title="UI pages"
          description="Role-based үндсэн хуудсууд нь бүхэлдээ Монгол хэл дээрх card layout-тай."
        >
          <div className="stack-sm">
            {uiPages.map((page) => (
              <Link key={page.path} href={page.path} className="table-row">
                <div className="action-row" style={{ justifyContent: "space-between" }}>
                  <strong>{page.title}</strong>
                  <span className="code-link">{page.path}</span>
                </div>
                <p className="muted-text">{page.purpose}</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Subscription model"
          description="Completed video бүр 1 кредит. Үнэ MNT дээр тогтоосон."
        >
          <div className="grid-2">
            {subscriptionPlans.map((plan) => (
              <article key={plan.id} className="mini-card stack-sm">
                <div className="action-row" style={{ justifyContent: "space-between" }}>
                  <strong>{plan.label}</strong>
                  {plan.recommended ? (
                    <span className="badge badge-accent">Санал болгож буй</span>
                  ) : null}
                </div>
                <p className="metric-value">{plan.credits}</p>
                <p className="muted-text">{formatMnt(plan.priceMnt)}</p>
                <p className="muted-text">{plan.description}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </section>
    </PostlyShell>
  );
}
