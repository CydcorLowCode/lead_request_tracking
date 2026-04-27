import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";

import { UploadForm } from "./upload-form";

export default async function NewImportPage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (!ctx.isTerritoryTeam) {
    redirect("/my-requests");
  }

  return (
    <div className="mx-auto w-full max-w-[960px] px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/imports"
            className="text-[13px] font-medium text-[var(--accent)] hover:underline"
          >
            ← Back to imports
          </Link>
          <h1 className="mt-3 text-[20px] font-semibold tracking-tight text-[var(--foreground)]">
            Upload AT&amp;T Report
          </h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">NAM REQUESTS sheet · .xlsx only</p>
        </div>
      </div>
      <UploadForm />
    </div>
  );
}
