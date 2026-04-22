"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { commitImport } from "@/app/imports/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importId: string;
  applyCount: number;
  ambiguousUnresolved: number;
  errorRows: number;
};

export function CommitImportDialog({
  open,
  onOpenChange,
  importId,
  applyCount,
  ambiguousUnresolved,
  errorRows,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onConfirm() {
    setLoading(true);
    const res = await commitImport(importId);
    setLoading(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    onOpenChange(false);
    toast.success(
      `Applied ${res.applied_updates} updates, ${res.applied_inserts} new, ${res.applied_resolved} resolved.`,
    );
    router.push(`/imports/${importId}?committed=true`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply import?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-[13px] text-[var(--secondary)]">
              <p>
                Ready to apply{" "}
                <span className="font-mono text-[var(--foreground)]">{applyCount}</span> changes?
              </p>
              {ambiguousUnresolved > 0 ? (
                <div className="rounded-[6px] border border-[var(--amber)]/40 bg-[var(--amber-bg)] px-3 py-2 text-[12px] text-[var(--amber)]">
                  {ambiguousUnresolved} ambiguous row{ambiguousUnresolved === 1 ? "" : "s"} will be skipped and
                  saved for later — resolve them from the Unresolved tab.
                </div>
              ) : null}
              {errorRows > 0 ? (
                <div className="rounded-[6px] border border-[var(--amber)]/40 bg-[var(--amber-bg)] px-3 py-2 text-[12px] text-[var(--amber)]">
                  {errorRows} row{errorRows === 1 ? "" : "s"} have errors and will be skipped. Fix the underlying data
                  and re-import to include them.
                </div>
              ) : null}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--border)] px-4 text-[13px] text-[var(--secondary)] hover:bg-[var(--input)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] px-4 text-[13px] font-medium text-white disabled:opacity-50"
          >
            {loading ? "Applying…" : "Confirm apply"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
