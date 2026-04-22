/**
 * Pure string and lead-area normalization for AT&T import matching (no DB I/O).
 */

/** Lowercase, trim, collapse whitespace; commas/periods become spaces so formatting noise does not break equality. */
export function normalizeString(s: string | null | undefined): string {
  if (s == null) return "";
  return s
    .trim()
    .toLowerCase()
    .replace(/[,\\.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Concatenate non-null areas with " | ", then {@link normalizeString}. */
export function normalizeLeadArea(areas: (string | null | undefined)[]): string {
  const parts = areas
    .filter((a): a is string => a != null && String(a).trim() !== "")
    .map((a) => String(a).trim());
  return normalizeString(parts.join(" | "));
}

const ZIP_RE = /\b\d{5}\b/g;

/** Five-digit zips; deduped and sorted ascending. */
export function extractZips(s: string | null | undefined): string[] {
  if (s == null || s === "") return [];
  const found = s.match(ZIP_RE);
  if (!found?.length) return [];
  return [...new Set(found)].sort();
}

/** True if normalized strings match or zip lists overlap. */
export function leadAreasMatch(incomingArea: string, candidateArea: string): boolean {
  const a = normalizeString(incomingArea);
  const b = normalizeString(candidateArea);
  if (a !== "" && a === b) return true;
  const za = extractZips(incomingArea);
  const zb = extractZips(candidateArea);
  if (za.length === 0 || zb.length === 0) return false;
  const setB = new Set(zb);
  return za.some((z) => setB.has(z));
}
