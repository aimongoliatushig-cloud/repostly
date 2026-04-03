import { NextResponse } from "next/server";

import { organAvatars } from "@/lib/postly-data";

export function GET() {
  return NextResponse.json({
    items: organAvatars,
  });
}
