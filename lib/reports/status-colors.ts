import type { LeadRequestStatus } from "@/types/enums";

export type StatusColor = {
  fill: string;
  stroke: string;
  label: string;
};

export const STATUS_COLORS: Record<LeadRequestStatus, StatusColor> = {
  new: { fill: "#6b7280", stroke: "#4b5563", label: "New" },
  submitted_to_client: { fill: "#4f7cff", stroke: "#3d6aed", label: "Submitted to AT&T" },
  leads_received: { fill: "#a855f7", stroke: "#9333ea", label: "Leads Received" },
  visible_in_salesforce: { fill: "#22c55e", stroke: "#16a34a", label: "Visible in Salesforce" },
  declined: { fill: "#ef4444", stroke: "#dc2626", label: "Declined" },
  market_proposal_answered: { fill: "#06b6d4", stroke: "#0891b2", label: "Market Proposal Answered" },
  leads_pulled_back: { fill: "#f59e0b", stroke: "#d97706", label: "Leads Pulled Back" },
};
