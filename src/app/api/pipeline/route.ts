import { NextResponse } from "next/server";

import { getMissingIntegrationKeys } from "@/lib/env";
import { deliveryMilestones, pipelineStages } from "@/lib/workflow";

export function GET() {
  return NextResponse.json({
    product: "Postly.mn",
    workflow: pipelineStages,
    milestones: deliveryMilestones,
    missingEnvironmentKeys: getMissingIntegrationKeys(),
  });
}
