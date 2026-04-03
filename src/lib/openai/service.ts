import { getOpenAiApiKey, getOpenAiModel, hasOpenAiEnv } from "@/lib/env";

export type PlannedScene = {
  title: string;
  narration: string;
  visualPrompt: string;
  animationPrompt: string;
  durationSeconds: number;
};

export type PlannedProject = {
  title: string;
  topic: string;
  hook: string;
  scriptText: string;
  ctaText: string;
  estimatedDurationSeconds: number;
  scenes: PlannedScene[];
  provider: "openai" | "template";
  providerNote?: string;
};

function extractJsonBlock(content: string) {
  const fenced = content.match(/```json\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1];
  }

  const objectStart = content.indexOf("{");
  const objectEnd = content.lastIndexOf("}");

  if (objectStart >= 0 && objectEnd > objectStart) {
    return content.slice(objectStart, objectEnd + 1);
  }

  return content;
}

async function requestPlanning<T>(prompt: string) {
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    throw new Error("OpenAI API түлхүүр тохируулаагүй байна.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAiModel(),
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are the planning engine for Postly AI. Output only valid JSON. All user-facing text must be Mongolian. Keep healthcare tone practical, clear, engaging, and safe. Scene prompts can be technical but scene titles and narration must stay in Mongolian.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI planning алдаа: ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI planning хоосон хариу ирүүллээ.");
  }

  return JSON.parse(extractJsonBlock(content)) as T;
}

function clampDuration(value: number, fallback: number, max: number) {
  const candidate = Number.isFinite(value) ? Math.round(value) : fallback;

  return Math.max(3, Math.min(candidate, max));
}

function normalizeBrollPlan(plan: Omit<PlannedProject, "provider">): PlannedProject {
  const scenes = plan.scenes.slice(0, 7).map((scene, index) => ({
    ...scene,
    title: scene.title?.trim() || `Scene ${index + 1}`,
    narration: scene.narration?.trim() || "",
    visualPrompt: scene.visualPrompt?.trim() || "",
    animationPrompt: scene.animationPrompt?.trim() || "",
    durationSeconds: clampDuration(scene.durationSeconds, 6, 8),
  }));
  const estimatedDurationSeconds = scenes.reduce(
    (sum, scene) => sum + scene.durationSeconds,
    0,
  );

  return {
    ...plan,
    estimatedDurationSeconds: Math.min(45, estimatedDurationSeconds),
    scenes,
    provider: "openai",
  };
}

function normalizeOrganPlan(plan: Omit<PlannedProject, "provider">): PlannedProject {
  const scenes = plan.scenes.slice(0, 5).map((scene, index) => ({
    ...scene,
    title: scene.title?.trim() || `Сегмент ${index + 1}`,
    narration: scene.narration?.trim() || "",
    visualPrompt: scene.visualPrompt?.trim() || "",
    animationPrompt: scene.animationPrompt?.trim() || "",
    durationSeconds: 8,
  }));

  while (scenes.length < 5) {
    scenes.push({
      title: `Сегмент ${scenes.length + 1}`,
      narration: "",
      visualPrompt: "",
      animationPrompt: "",
      durationSeconds: 8,
    });
  }

  return {
    ...plan,
    estimatedDurationSeconds: 40,
    scenes,
    provider: "openai",
  };
}

function buildBrollFallbackPlan(input: {
  doctorName: string;
  specialization: string;
  brandName: string;
}) {
  return {
    title: `${input.specialization} сэдвийн богино reel`,
    topic: `${input.specialization}-ийн түгээмэл анхааруулах дохио`,
    hook: `${input.doctorName} эмчийн тайлбар: эхний шинжийг бүү өнгөрөө`,
    scriptText:
      "Эхний дохион дээр анхаарал татаж, эрсдэл, тайлбар, шийдэл, CTA дарааллаар явна.",
    ctaText: `${input.brandName}-д үзлэгийн цаг захиалахыг уриална.`,
    estimatedDurationSeconds: 42,
    scenes: [
      {
        title: "Анхаарал татах эхлэл",
        narration: "Энэ шинжийг энгийн гэж бодоод өнгөрч болохгүй.",
        visualPrompt:
          "Doctor head visible, vertical reel framing, medical studio lighting, high trust healthcare feel",
        animationPrompt: "Fast push-in and steady medium close-up",
        durationSeconds: 6,
      },
      {
        title: "Эхний дохио",
        narration: "Өдөр тутам давтагдаж байгаа энэ өөрчлөлт бол анхны дохио байж болно.",
        visualPrompt: "Close-up b-roll that explains the first symptom clearly",
        animationPrompt: "Slow left-to-right pan with simple text reveal",
        durationSeconds: 6,
      },
      {
        title: "Хоёр дахь дохио",
        narration: "Хэрэв ийм зовиур давтагдвал үзлэгээ хойшлуулж болохгүй.",
        visualPrompt: "Symptom-focused medical b-roll with trustworthy clinical tone",
        animationPrompt: "Gentle zoom with infographic emphasis",
        durationSeconds: 6,
      },
      {
        title: "Эрсдэлийн тайлбар",
        narration: "Энэ нь тухайн эрхтний ачаалал нэмэгдсэний илрэл байх боломжтой.",
        visualPrompt: "Anatomical explainer shot, clean healthcare visuals",
        animationPrompt: "Layered callout animation on top of b-roll",
        durationSeconds: 6,
      },
      {
        title: "Юу хийх вэ",
        narration: "Эрт үзлэг, зөв шинжилгээ нь асуудлыг хурдан барих хамгийн зөв алхам.",
        visualPrompt: "Consultation room and diagnostic process b-roll",
        animationPrompt: "Soft transition into consultation workflow",
        durationSeconds: 6,
      },
      {
        title: "Итгэл төрүүлэх төгсгөл",
        narration: "Шинжийг зөв үед нь үнэлүүлбэл эмчилгээ илүү үр дүнтэй байдаг.",
        visualPrompt: "Doctor reassurance shot with brand color ambience",
        animationPrompt: "Static reassuring frame with subtle motion accents",
        durationSeconds: 6,
      },
      {
        title: "CTA",
        narration: `${input.brandName}-д цаг авч мэргэжлийн зөвлөгөө аваарай.`,
        visualPrompt: "Brand CTA card with logo, phone, and appointment prompt",
        animationPrompt: "Logo reveal and contact detail fade in",
        durationSeconds: 6,
      },
    ],
    provider: "template" as const,
    providerNote: "OPENAI_API_KEY тохируулаагүй тул template planning ашиглав.",
  } satisfies PlannedProject;
}

function buildOrganFallbackPlan(input: {
  organLabel: string;
  organDescription: string;
  brandName: string;
}) {
  return {
    title: `${input.organLabel} яагаад дохио өгдөг вэ?`,
    topic: `${input.organLabel}-ийн анхаарах сэдэв`,
    hook: `Би бол ${input.organLabel}. Надаас ирж буй энэ дохиог бүү тоо.`,
    scriptText:
      "5 сегменттэй organ talk: hook, эрсдэл, шинж тэмдэг, шийдэл, CTA.",
    ctaText: `${input.brandName}-д үзлэгийн цаг авах CTA.`,
    estimatedDurationSeconds: 40,
    scenes: [
      {
        title: "Hook",
        narration: `Би бол ${input.organLabel}. Намайг ядрааж байгаа дохиог та анзаарах хэрэгтэй.`,
        visualPrompt: `${input.organDescription}. Pixar-quality organ avatar, vertical reel, clean medical background`,
        animationPrompt: "Character pops in and speaks directly to camera",
        durationSeconds: 8,
      },
      {
        title: "Эрсдэл",
        narration: "Өдөр тутмын зуршил надад чимээгүй ачаалал өгдөг.",
        visualPrompt: "Avatar with surrounding lifestyle risk icons",
        animationPrompt: "Icons animate around the main avatar",
        durationSeconds: 8,
      },
      {
        title: "Шинж тэмдэг",
        narration: "Эдгээр шинж удаан үргэлжилбэл үзлэгээ хойшлуулах хэрэггүй.",
        visualPrompt: "Avatar explaining symptoms with clear overlays",
        animationPrompt: "Three symptom cards slide into frame",
        durationSeconds: 8,
      },
      {
        title: "Шийдэл",
        narration: "Эрт шинжилгээ, зөвлөгөө хоёр хамгийн том ялгаа гаргадаг.",
        visualPrompt: "Avatar in a reassuring healthcare environment",
        animationPrompt: "Steady camera with continuity-friendly motion",
        durationSeconds: 8,
      },
      {
        title: "CTA",
        narration: `${input.brandName}-д цаг аваад мэргэжлийн үзлэгт хамрагдаарай.`,
        visualPrompt: "Avatar concludes with brand CTA and clean medical visual",
        animationPrompt: "Slow push-in for final CTA delivery",
        durationSeconds: 8,
      },
    ],
    provider: "template" as const,
    providerNote: "OPENAI_API_KEY тохируулаагүй тул template planning ашиглав.",
  } satisfies PlannedProject;
}

export async function generateBrollPlan(input: {
  doctorName: string;
  specialization: string;
  brandName: string;
}) {
  if (!hasOpenAiEnv()) {
    return buildBrollFallbackPlan(input);
  }

  const plan = await requestPlanning<Omit<PlannedProject, "provider">>(`
Return JSON with keys:
title, topic, hook, scriptText, ctaText, estimatedDurationSeconds, scenes.
Scenes must be an array of up to 7 items.
Each scene must include: title, narration, visualPrompt, animationPrompt, durationSeconds.

Context:
- Content type: B-roll + head explainer
- Output language: Mongolian
- Brand name: ${input.brandName}
- Doctor name: ${input.doctorName}
- Doctor specialization: ${input.specialization}
- Total video must stay within 45 seconds
- Doctor head is always visible in the intended workflow
- User uploaded doctor audio, so scenes should support clean B-roll cut points
- Opening must have a strong hook in the first 2 seconds
- CTA should fit brand healthcare marketing use

Keep the story practical, medically responsible, and edit-friendly.
`);

  return normalizeBrollPlan(plan);
}

export async function generateOrganPlan(input: {
  organLabel: string;
  organDescription: string;
  brandName: string;
}) {
  if (!hasOpenAiEnv()) {
    return buildOrganFallbackPlan(input);
  }

  const plan = await requestPlanning<Omit<PlannedProject, "provider">>(`
Return JSON with keys:
title, topic, hook, scriptText, ctaText, estimatedDurationSeconds, scenes.
Scenes must be an array of exactly 5 items.
Each scene must include: title, narration, visualPrompt, animationPrompt, durationSeconds.

Context:
- Content type: Organ talk
- Output language: Mongolian
- Brand name: ${input.brandName}
- Organ avatar label: ${input.organLabel}
- Organ description: ${input.organDescription}
- Total video must stay within 40 seconds
- Structure: 5 segments x 8 seconds
- CTA may be embedded inside narration
- Continuity between segments matters
- Opening must have a strong hook

Keep the tone clear, engaging, and friendly for hospital social content.
`);

  return normalizeOrganPlan(plan);
}
