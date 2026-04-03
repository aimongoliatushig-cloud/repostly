import { NextResponse } from "next/server";

import {
  apiGroups,
  bRollFlow,
  databaseSections,
  organTalkFlow,
  uiPages,
} from "@/lib/postly-data";
import { getMissingIntegrationKeys } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    product: "Postly AI",
    environment: {
      missingKeys: getMissingIntegrationKeys(),
    },
    databaseSchema: databaseSections,
    apiGroups,
    uiPages,
    productionFlows: [
      {
        type: "b_roll_head_explainer",
        limitSeconds: 45,
        steps: bRollFlow,
      },
      {
        type: "organ_talk",
        limitSeconds: 40,
        steps: organTalkFlow,
      },
    ],
  });
}
