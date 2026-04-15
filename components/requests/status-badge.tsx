import type { LeadRequestStatus } from "@/types/enums";

const STATUS_BADGE_STYLES: Record<
  LeadRequestStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-[#242834] text-[var(--secondary)]",
  },
  submitted_to_client: {
    label: "Submitted to AT&T",
    className: "bg-[#4f7cff26] text-[var(--status-blue)]",
  },
  leads_received: {
    label: "Leads Received by Cydcor",
    className: "bg-[#a855f72b] text-[var(--status-purple)]",
  },
  visible_in_salesforce: {
    label: "Visible in Salesforce",
    className: "bg-[#22c55e26] text-[var(--status-green)]",
  },
  declined: {
    label: "Declined",
    className: "bg-[#ef444433] text-[var(--status-red)]",
  },
  market_proposal_answered: {
    label: "Market Proposal Answered",
    className: "bg-[#f59e0b26] text-[var(--status-amber)]",
  },
  leads_pulled_back: {
    label: "Leads Pulled Back by Client",
    className: "bg-[#f59e0b26] text-[var(--status-amber)]",
  },
};

export function StatusBadge({ status }: { status: LeadRequestStatus }) {
  const config = STATUS_BADGE_STYLES[status];
  return (
    <span
      className={`inline-flex h-7 items-center rounded-[6px] border border-[var(--border)] px-2.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
