import { redirect, notFound } from "next/navigation";

import { getImportPreview } from "@/app/imports/actions";
import { getSessionContext } from "@/lib/auth/get-session-user";

import { PreviewClient } from "./preview-client";

export default async function ImportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (!ctx.isTerritoryTeam) {
    redirect("/my-requests");
  }

  const { id } = await params;
  const preview = await getImportPreview(id);
  if ("error" in preview) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-10">
      <PreviewClient importData={preview.import} rows={preview.rows} profileNames={preview.profileNames} />
    </div>
  );
}
