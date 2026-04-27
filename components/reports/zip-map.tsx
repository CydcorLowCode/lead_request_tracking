"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { loadZipCentroids } from "@/lib/geo/zip-centroids";
import { STATUS_COLORS } from "@/lib/reports/status-colors";
import { aggregateRequestsByZip, type ZipMarker } from "@/lib/reports/zip-map-aggregation";
import type { RequestWithFormData } from "@/lib/reports/extract-zips";

const ZipMapInner = dynamic(() => import("./zip-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] text-[13px] text-[var(--muted)]">
      Loading map…
    </div>
  ),
});

type Props = {
  requests: RequestWithFormData[];
  height?: number; // px, default 520
};

export function ZipMap({ requests, height = 520 }: Props) {
  const [markers, setMarkers] = useState<ZipMarker[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadZipCentroids()
      .then((centroids) => {
        if (cancelled) return;
        setMarkers(aggregateRequestsByZip(requests, centroids));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load map data.");
      });
    return () => {
      cancelled = true;
    };
  }, [requests]);

  function handleExportByLocation() {
    if (!markers || markers.length === 0) {
      return;
    }
    const headers = ["Zip", "Requests", "Dominant Status"];
    const rows = markers.map((marker) => [
      marker.zip,
      String(marker.requestCount),
      STATUS_COLORS[marker.dominantStatus].label,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report-by-location.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-[18px] py-[14px]">
        <h3 className="text-[15px] font-semibold text-[var(--foreground)]">By Location</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportByLocation}
            disabled={!markers || markers.length === 0}
            className="inline-flex h-7 items-center rounded-[6px] border border-[var(--border)] bg-transparent px-2.5 text-[11px] font-medium text-[var(--secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export
          </button>
          {markers !== null ? (
            <span className="text-[11px] text-[var(--muted)]">
              {markers.length} zip{markers.length === 1 ? "" : "s"} ·{" "}
              {markers.reduce((acc, m) => acc + m.requestCount, 0)} requests
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div
          className="flex items-center justify-center px-6 text-center text-[13px] text-[var(--status-red)]"
          style={{ height: `${height}px` }}
        >
          {error}
        </div>
      ) : markers === null ? (
        <div
          className="flex items-center justify-center text-[13px] text-[var(--muted)]"
          style={{ height: `${height}px` }}
        >
          Loading map…
        </div>
      ) : markers.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-1 px-6 text-center"
          style={{ height: `${height}px` }}
        >
          <p className="text-[13px] text-[var(--secondary)]">
            No zip codes in this date range.
          </p>
          <p className="text-[11px] text-[var(--muted)]">
            Some request types (Business Trip, Market Proposal) don&apos;t include zip codes.
          </p>
        </div>
      ) : (
        <ZipMapInner markers={markers} height={height} />
      )}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] px-[18px] py-3">
        {Object.entries(STATUS_COLORS).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: value.fill }}
              aria-hidden
            />
            <span className="text-[11px] text-[var(--muted)]">{value.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
