import { apiGroups, bRollFlow, organTalkFlow, uiPages } from "@/lib/postly-data";

export const productionFlows = [
  {
    title: "B-roll + эмч тайлбар",
    limit: "45 секунд",
    steps: bRollFlow,
  },
  {
    title: "Organ talk",
    limit: "40 секунд",
    steps: organTalkFlow,
  },
] as const;

export const apiSurface = apiGroups.flatMap((group) =>
  group.routes.map((route) => ({
    label: `${route.method} ${route.path}`,
    description: route.purpose,
    href: "/api/pipeline",
  })),
);

export const pageSurface = uiPages.map((page) => ({
  ...page,
  label: page.title,
}));
