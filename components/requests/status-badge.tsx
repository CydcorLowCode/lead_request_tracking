import type { LeadRequestStatus } from "@/types/enums";

const STATUS_BADGE_CONFIG: Record<
  LeadRequestStatus,
  { label: string; variant: string; dotClass: string }
> = {
  new: {
    label: "New",
    variant: "lrt-badge-new",
    dotClass: "bg-[var(--muted)]",
  },
  submitted_to_client: {
    label: "Submitted to AT&T",
    variant: "lrt-badge-submitted",
    dotClass: "bg-[var(--accent)]",
  },
  leads_received: {
    label: "Leads Received by Cydcor",
    variant: "lrt-badge-received",
    dotClass: "bg-[var(--status-purple)]",
  },
  visible_in_salesforce: {
    label: "Visible in Salesforce",
    variant: "lrt-badge-complete",
    dotClass: "bg-[var(--status-green)]",
  },
  declined: {
    label: "Declined",
    variant: "lrt-badge-declined",
    dotClass: "bg-[var(--status-red)]",
  },
  market_proposal_answered: {
    label: "Market Proposal Answered",
    variant: "lrt-badge-amber",
    dotClass: "bg-[var(--status-amber)]",
  },
  leads_pulled_back: {
    label: "Leads Pulled Back by Client",
    variant: "lrt-badge-pulled",
    dotClass: "bg-[var(--status-amber)]",
  },
};

export function StatusBadge({ status }: { status: LeadRequestStatus }) {
  const config = STATUS_BADGE_CONFIG[status];
  return (
    <span className={`lrt-badge ${config.variant}`}>
      <span className={`lrt-badge-dot ${config.dotClass}`} aria-hidden />
      {config.label}
    </span>
  );
}
