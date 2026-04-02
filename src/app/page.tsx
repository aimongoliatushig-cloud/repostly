import { getIntegrationStatuses } from "@/lib/env";
import {
  apiSurface,
  deliveryMilestones,
  mvpChecklist,
  pipelineStages,
} from "@/lib/workflow";

export default function Home() {
  const integrations = getIntegrationStatuses();
  const configuredCount = integrations.filter(
    (integration) => integration.configured,
  ).length;

  return (
    <main className="grid-line flex flex-1 justify-center px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="flex w-full max-w-7xl flex-col gap-6">
        <section className="panel relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(12,143,121,0.15),transparent_65%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow rounded-full border border-accent/20 bg-accent-soft px-3 py-2">
                  Healthcare video system
                </span>
                <span className="rounded-full border border-line bg-surface-strong px-3 py-2 text-sm text-muted">
                  Next.js starter is live
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
                  Postly.mn
                </p>
                <h1 className="section-title max-w-4xl text-5xl leading-none sm:text-6xl lg:text-7xl">
                  Turn one doctor image and one audio clip into a clinic-ready reel.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                  This setup gives you a product-facing homepage, environment
                  scaffolding for OpenAI, HeyGen, and Supabase, plus starter API
                  endpoints to track the MVP pipeline from upload to delivery.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
                  href="/api/pipeline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Inspect pipeline JSON
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-full border border-line bg-surface-strong px-5 py-3 text-sm font-semibold transition hover:bg-white"
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                >
                  Check health endpoint
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-line bg-[#163330] p-5 text-[#f8f4ea]">
                <p className="eyebrow text-[#8dd4c9]">Setup snapshot</p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-4xl font-semibold">{configuredCount}/4</p>
                    <p className="mt-2 text-sm leading-6 text-[#b9d7d1]">
                      Core integrations configured
                    </p>
                  </div>
                  <div className="space-y-3">
                    {integrations.map((integration) => (
                      <div
                        key={integration.key}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium">{integration.label}</span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              integration.configured
                                ? "bg-[#c7f5de] text-[#104b3d]"
                                : "bg-[#f8d9c4] text-[#6f3512]"
                            }`}
                          >
                            {integration.configured ? "Configured" : "Missing"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#b9d7d1]">
                          {integration.hint}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-line bg-surface-strong p-5">
                <p className="eyebrow">Starter routes</p>
                <div className="mt-4 space-y-3">
                  {apiSurface.map((route) => (
                    <div
                      key={route.href}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{route.label}</p>
                        <p className="text-sm text-muted">{route.description}</p>
                      </div>
                      <a
                        className="rounded-full border border-line px-3 py-1 text-sm font-medium transition hover:bg-accent-soft"
                        href={route.href}
                      >
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel rounded-[2rem] px-6 py-7 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">MVP path</p>
                <h2 className="section-title mt-3 text-3xl sm:text-4xl">
                  Pipeline from upload to final MP4
                </h2>
              </div>
              <span className="rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-strong">
                Week 1 to Week 4
              </span>
            </div>

            <div className="mt-8 grid gap-4">
              {pipelineStages.map((stage, index) => (
                <div
                  key={stage.title}
                  className="grid gap-4 rounded-[1.5rem] border border-line bg-surface-strong px-5 py-5 md:grid-cols-[56px_1fr]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold">{stage.title}</h3>
                      <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        {stage.state}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-muted">
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel rounded-[2rem] px-6 py-7 sm:px-8">
              <p className="eyebrow">Immediate checklist</p>
              <h2 className="section-title mt-3 text-3xl">What is ready now</h2>
              <div className="mt-6 space-y-3">
                {mvpChecklist.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-line bg-surface-strong px-5 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{item.title}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.ready
                            ? "bg-[#d8f5ee] text-[#0b5e55]"
                            : "bg-[#f7e3cf] text-[#87511e]"
                        }`}
                      >
                        {item.ready ? "Ready" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel rounded-[2rem] px-6 py-7 sm:px-8">
              <p className="eyebrow">Execution lanes</p>
              <h2 className="section-title mt-3 text-3xl">Next delivery moves</h2>
              <div className="mt-6 grid gap-3">
                {deliveryMilestones.map((milestone) => (
                  <div
                    key={milestone.title}
                    className="rounded-[1.5rem] border border-line bg-surface-strong px-5 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{milestone.title}</p>
                      <span className="text-sm font-semibold text-accent-strong">
                        {milestone.window}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {milestone.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
