import { NextResponse } from "next/server";

import { recentProjects } from "@/lib/postly-data";

export function GET() {
  return NextResponse.json({
    items: recentProjects,
    total: recentProjects.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const contentType = body.contentType;

  if (
    contentType !== "b_roll_head_explainer" &&
    contentType !== "organ_talk"
  ) {
    return NextResponse.json(
      { error: "contentType нь b_roll_head_explainer эсвэл organ_talk байх ёстой." },
      { status: 400 },
    );
  }

  const durationLimitSeconds =
    contentType === "b_roll_head_explainer" ? 45 : 40;

  return NextResponse.json(
    {
      accepted: true,
      creditCheck: {
        remainingCredits: 8,
        canGenerate: true,
      },
      project: {
        id: `draft-${contentType}`,
        contentType,
        status: "draft",
        title:
          contentType === "b_roll_head_explainer"
            ? "Шинэ B-roll төсөл"
            : "Шинэ organ talk төсөл",
      },
      durationLimitSeconds,
    },
    { status: 201 },
  );
}
