import { redirect } from "next/navigation";

export default function LegacyBrandSettingsPage() {
  redirect("/dashboard/settings");
}
