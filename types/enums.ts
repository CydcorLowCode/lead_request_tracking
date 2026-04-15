/** Values aligned with `lrt_lead_requests.lead_type` check constraint in DB */
export const LEAD_TYPES = [
  "permanent_assignment",
  "business_trip",
  "nlt_new_fiber",
  "market_proposal",
  "oof_wireless",
  "pullback",
] as const;

export type LeadType = (typeof LEAD_TYPES)[number];

/** Values aligned with `lrt_lead_requests.status` */
export const LEAD_REQUEST_STATUSES = [
  "new",
  "submitted_to_client",
  "leads_received",
  "visible_in_salesforce",
  "declined",
  "market_proposal_answered",
  "leads_pulled_back",
] as const;

export type LeadRequestStatus = (typeof LEAD_REQUEST_STATUSES)[number];
