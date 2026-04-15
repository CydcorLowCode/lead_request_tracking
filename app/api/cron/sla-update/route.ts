import { NextResponse } from "next/server";

/** Placeholder for SLA recompute / status updates. */
export async function POST() {
  return NextResponse.json(
    { ok: false, message: "sla-update not implemented" },
    { status: 501 },
  );
}
