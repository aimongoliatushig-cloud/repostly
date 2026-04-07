import type { TableRow } from "@/lib/supabase/database.types";

export type AvatarView = TableRow<"avatars"> & {
  imageSignedUrl: string | null;
};

export type DoctorListItem = TableRow<"doctors"> & {
  portraitSignedUrl: string | null;
  avatarCount: number;
  primaryAvatar: AvatarView | null;
};

export type DoctorDetailView = {
  doctor: TableRow<"doctors">;
  portraitSignedUrl: string | null;
  avatars: AvatarView[];
  primaryAvatar: AvatarView | null;
};

export type BrandSettingsView = {
  brand: TableRow<"brands">;
  settings: TableRow<"brand_settings">;
  logoSignedUrl: string | null;
  frameSignedUrl: string | null;
  outroSignedUrl: string | null;
};

export type HospitalDashboardSummary = {
  totalDoctors: number;
  activeProjects: number;
  recentDoctor: DoctorListItem | null;
  hospitalName: string;
};
