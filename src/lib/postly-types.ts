export type AppRole = "admin" | "brand" | "agent";

export type SubscriptionPlanId = "plan_5" | "plan_10" | "plan_15" | "plan_20";

export type ContentType = "b_roll_head_explainer" | "organ_talk";

export type ProjectStatus =
  | "draft"
  | "planning"
  | "queued"
  | "rendering"
  | "completed"
  | "failed";

export type SceneStatus =
  | "editable"
  | "queued"
  | "rendering"
  | "ready"
  | "failed";

export type JobStatus =
  | "queued"
  | "processing"
  | "retrying"
  | "succeeded"
  | "failed";

export type JobType =
  | "topic_hook"
  | "storyboard"
  | "animation_plan"
  | "script"
  | "scene_video"
  | "scene_voice"
  | "merge";

export type DatabaseColumn = {
  name: string;
  type: string;
  notes: string;
};

export type DatabaseTable = {
  name: string;
  purpose: string;
  columns: DatabaseColumn[];
};

export type DatabaseSection = {
  title: string;
  description: string;
  tables: DatabaseTable[];
};

export type ApiRouteSpec = {
  method: "GET" | "POST" | "PATCH";
  path: string;
  title: string;
  purpose: string;
  request: string[];
  response: string[];
};

export type ApiGroup = {
  title: string;
  description: string;
  routes: ApiRouteSpec[];
};

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  credits: number;
  priceMnt: number;
  label: string;
  description: string;
  recommended?: boolean;
};

export type Doctor = {
  id: string;
  fullName: string;
  specialization: string;
  brandName: string;
  initials: string;
  availability: string;
};

export type OrganAvatar = {
  id: string;
  label: string;
  tone: string;
  description: string;
};

export type SceneCard = {
  id: string;
  order: number;
  title: string;
  durationSeconds: number;
  status: SceneStatus;
  visualPrompt: string;
  animationPrompt: string;
  narration: string;
};

export type ProjectSummary = {
  id: string;
  contentType: ContentType;
  title: string;
  status: ProjectStatus;
  doctorName?: string;
  organAvatar?: string;
  creditsUsed: number;
  durationLimitSeconds: number;
  scenes: number;
  updatedAt: string;
};

export type QueueJob = {
  id: string;
  projectId: string;
  title: string;
  jobType: JobType;
  provider: "openai" | "kie" | "system";
  status: JobStatus;
  retryCount: number;
  sceneId?: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
};

export type PageLink = {
  href: string;
  label: string;
  description: string;
};
