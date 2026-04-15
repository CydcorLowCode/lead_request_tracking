import type { Tables } from "@/types/database";

export type SlaConfigRow = Tables<"lrt_sla_configs">;

/**
 * Computes SLA due time from submission / anchor time and configured hours.
 */
export function computeSlaDueAt(
  anchor: Date,
  slaHours: number,
): Date {
  return new Date(anchor.getTime() + slaHours * 60 * 60 * 1000);
}

export function pickSlaConfigForLeadType(
  configs: SlaConfigRow[],
  leadType: string,
): SlaConfigRow | undefined {
  return configs.find((c) => c.lead_type === leadType);
}
