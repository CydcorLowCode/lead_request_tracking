import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/auth/get-session-user";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.isTerritoryTeam) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { ok: false, message: "export not implemented" },
    { status: 501 },
  );
}
