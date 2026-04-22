"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { createImport } from "@/app/imports/actions";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [warnLarge, setWarnLarge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const pickFile = useCallback((f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      setWarnLarge(false);
      return;
    }
    if (!f.name.toLowerCase().endsWith(".xlsx")) {
      setError("Please choose an .xlsx file.");
      setFile(null);
      setWarnLarge(false);
      return;
    }
    setFile(f);
    setWarnLarge(f.size > MAX_BYTES);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a spreadsheet file.");
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const res = await createImport(fd);
    setLoading(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    router.push(`/imports/${res.importId}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(ev) => pickFile(ev.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pickFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed px-6 py-14 transition-colors",
          drag
            ? "border-[var(--accent)] bg-[var(--accent-glow)]"
            : "border-[var(--border-hover)] bg-[var(--input)] hover:border-[var(--accent)]/50",
        )}
      >
        <p className="text-[14px] font-medium text-[var(--foreground)]">Drop .xlsx here</p>
        <p className="mt-2 text-[13px] text-[var(--muted)]">or click to browse</p>
      </button>

      {file ? (
        <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <p className="font-mono text-[13px] text-[var(--foreground)]">{file.name}</p>
          <p className="mt-1 font-mono text-[12px] text-[var(--secondary)]">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          {warnLarge ? (
            <p className="mt-2 text-[12px] text-[var(--amber)]">
              File is over 10 MB — upload may be slow, but you can still continue.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-[10px] border border-[var(--red)]/40 bg-[var(--red-bg)] px-4 py-3 text-[13px] text-[var(--red)]"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading || !file}
        className="inline-flex h-11 w-full items-center justify-center rounded-[6px] border border-[var(--accent)] bg-[var(--accent)] text-[14px] font-medium text-white transition-colors hover:bg-[var(--accent2)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Parsing… this may take a moment for large sheets" : "Upload & Preview"}
      </button>
    </form>
  );
}
