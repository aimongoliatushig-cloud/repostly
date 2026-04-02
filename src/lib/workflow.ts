export const pipelineStages = [
  {
    title: "Upload assets",
    description:
      "Collect doctor portrait and source audio before anything touches the AI pipeline.",
    state: "Ready",
  },
  {
    title: "Transcribe with Whisper",
    description:
      "Convert raw speech into text so the system can detect symptoms, tone, and call-to-action.",
    state: "Scaffolded",
  },
  {
    title: "Analyze with GPT",
    description:
      "Extract topic, warning level, structure, and campaign intent from the transcript.",
    state: "Scaffolded",
  },
  {
    title: "Plan scenes",
    description:
      "Break the message into 3 to 4 visual beats before preview and approval.",
    state: "Planned",
  },
  {
    title: "Generate lip-sync video",
    description:
      "Send approved assets to HeyGen, poll status, then capture the returned video URL.",
    state: "Planned",
  },
  {
    title: "Compose delivery assets",
    description:
      "Layer subtitles and B-roll, then ship the final mp4 back to the clinic dashboard.",
    state: "Planned",
  },
] as const;

export const mvpChecklist = [
  {
    title: "Next.js app scaffold",
    description: "App Router, TypeScript, Tailwind, and linting are in place.",
    ready: true,
  },
  {
    title: "Environment template",
    description:
      "Required keys for OpenAI, HeyGen, and Supabase are documented in .env.example.",
    ready: true,
  },
  {
    title: "Health and pipeline endpoints",
    description:
      "Starter JSON routes exist for app health checks and workflow inspection.",
    ready: true,
  },
  {
    title: "Upload and generation actions",
    description:
      "Form handling, storage upload, and external API calls still need implementation.",
    ready: false,
  },
] as const;

export const deliveryMilestones = [
  {
    title: "Week 1",
    description: "Wire upload UI, transcription route, and transcript persistence.",
    window: "Build",
  },
  {
    title: "Week 2",
    description: "Connect HeyGen generation and add async status polling.",
    window: "Integrate",
  },
  {
    title: "Week 3",
    description: "Ship scene preview, approval, and regeneration loops.",
    window: "Refine",
  },
  {
    title: "Week 4",
    description: "Add subtitles, B-roll composition, and delivery tracking.",
    window: "Launch",
  },
] as const;

export const apiSurface = [
  {
    label: "GET /api/health",
    description: "Quick runtime status and configured integration count.",
    href: "/api/health",
  },
  {
    label: "GET /api/pipeline",
    description: "Returns the starter workflow map and missing environment keys.",
    href: "/api/pipeline",
  },
] as const;
