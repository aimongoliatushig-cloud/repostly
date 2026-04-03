import { NextResponse } from "next/server";

import { getIntegrationStatuses, getMissingIntegrationKeys } from "@/lib/env";

export function GET() {
  const integrations = getIntegrationStatuses();

  return NextResponse.json({
    app: "Postly AI",
    status: "ok",
    timestamp: new Date().toISOString(),
    configuredIntegrations: integrations.filter(
      (integration) => integration.configured,
    ).length,
    missingEnvironmentKeys: getMissingIntegrationKeys(),
    integrations,
  });
}
