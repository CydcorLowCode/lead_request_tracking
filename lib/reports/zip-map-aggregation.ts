import type { LeadRequestStatus } from "@/types/enums";
import { extractZipsFromRequest, type RequestWithFormData } from "./extract-zips";

export type ZipMarker = {
  zip: string;
  lat: number;
  lng: number;
  requestCount: number;
  dominantStatus: LeadRequestStatus;
  requestIds: string[];
};

/**
 * Collapses requests into one marker per zip code. Only zips present in the
 * centroid lookup are returned. Dominant status = status of the most recently
 * updated request at that zip.
 */
export function aggregateRequestsByZip(
  rows: RequestWithFormData[],
  centroids: Record<string, [number, number]>,
): ZipMarker[] {
  const byZip = new Map<string, { rows: RequestWithFormData[] }>();

  for (const row of rows) {
    const zips = extractZipsFromRequest(row);
    for (const zip of zips) {
      if (!centroids[zip]) continue;
      const bucket = byZip.get(zip) ?? { rows: [] };
      bucket.rows.push(row);
      byZip.set(zip, bucket);
    }
  }

  const markers: ZipMarker[] = [];
  for (const [zip, bucket] of byZip) {
    const [lat, lng] = centroids[zip];
    const sortedRows = [...bucket.rows].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
    markers.push({
      zip,
      lat,
      lng,
      requestCount: sortedRows.length,
      dominantStatus: sortedRows[0].status as LeadRequestStatus,
      requestIds: sortedRows.map((r) => r.id),
    });
  }

  return markers;
}
