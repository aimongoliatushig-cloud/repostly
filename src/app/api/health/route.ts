import { NextResponse } from "next/server";

import { getIntegrationStatuses } from "@/lib/env";

export function GET() {
  const integrations = getIntegrationStatuses();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    configuredIntegrations: integrations.filter(
      (integration) => integration.configured,
    ).length,
    integrations,
  });
}
