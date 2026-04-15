import { NextResponse } from "next/server";

/**
 * Placeholder for Salesforce-driven user / `lrt_user_campaigns` sync.
 * Secure with `CRON_SECRET` header or Vercel Cron auth before enabling.
 */
export async function POST() {
  return NextResponse.json(
    { ok: false, message: "sf-sync not implemented" },
    { status: 501 },
  );
}
