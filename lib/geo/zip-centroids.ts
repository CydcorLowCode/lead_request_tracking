let cache: Record<string, [number, number]> | null = null;
let inflight: Promise<Record<string, [number, number]>> | null = null;

export async function loadZipCentroids(): Promise<Record<string, [number, number]>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch("/data/zip-centroids.json", { cache: "force-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load zip centroids: ${r.status}`);
      return r.json() as Promise<Record<string, [number, number]>>;
    })
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export function lookupZip(
  centroids: Record<string, [number, number]>,
  zip: string,
): [number, number] | null {
  const normalized = zip.trim().padStart(5, "0").slice(0, 5);
  return centroids[normalized] ?? null;
}
