/**
 * Maps raw AT&T decision cells from NAM imports to `lrt_lead_requests.status` values.
 */
import type { LeadRequestStatus } from "@/types/enums";

import { normalizeString } from "./normalize";

/** APPROVED → leads_received; DENIED → declined; anything else → submitted_to_client. */
export function mapAttDecisionToLeadStatus(raw: string): LeadRequestStatus {
  const key = normalizeString(raw).replace(/\s+/g, " ").trim();
  if (key === "approved") return "leads_received";
  if (key === "denied") return "declined";
  return "submitted_to_client";
}
