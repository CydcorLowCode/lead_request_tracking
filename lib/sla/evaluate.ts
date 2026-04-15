import type { LeadRequestStatus } from "@/types/enums";

export type SlaDisplayStatus = "on_track" | "at_risk" | "overdue" | "completed";

export const TERMINAL_REQUEST_STATUSES = new Set<LeadRequestStatus>([
  "declined",
  "visible_in_salesforce",
  "leads_pulled_back",
  "market_proposal_answered",
]);

type EvaluateSlaStatusInput = {
  status: LeadRequestStatus;
  slaDueAt: string | null;
  warningHours: number | null;
  now?: Date;
};

export type SlaDisplayResult =
  | {
      status: "completed";
      hours: null;
    }
  | {
      status: "on_track";
      hours: null;
    }
  | {
      status: "at_risk" | "overdue";
      hours: number;
    }
  | null;

export function evaluateSlaStatus({
  status,
  slaDueAt,
  warningHours,
  now = new Date(),
}: EvaluateSlaStatusInput): SlaDisplayResult {
  if (TERMINAL_REQUEST_STATUSES.has(status)) {
    return { status: "completed", hours: null };
  }

  if (!slaDueAt) {
    return null;
  }

  const dueAt = new Date(slaDueAt);
  if (Number.isNaN(dueAt.getTime())) {
    return null;
  }

  const diffMs = dueAt.getTime() - now.getTime();
  if (diffMs < 0) {
    return {
      status: "overdue",
      hours: Math.ceil(Math.abs(diffMs) / 3600000),
    };
  }

  const warningMs = Math.max(0, (warningHours ?? 0) * 3600000);
  if (warningMs > 0 && now.getTime() > dueAt.getTime() - warningMs) {
    return {
      status: "at_risk",
      hours: Math.ceil(diffMs / 3600000),
    };
  }

  return { status: "on_track", hours: null };
}

export function compareBySlaPriority<
  T extends {
    status: LeadRequestStatus;
    sla_due_at: string | null;
    created_at: string;
    lead_type: string;
  },
>(a: T, b: T, warningHoursByLeadType: Record<string, number>) {
  const aSla = evaluateSlaStatus({
    status: a.status,
    slaDueAt: a.sla_due_at,
    warningHours: warningHoursByLeadType[a.lead_type] ?? null,
  });
  const bSla = evaluateSlaStatus({
    status: b.status,
    slaDueAt: b.sla_due_at,
    warningHours: warningHoursByLeadType[b.lead_type] ?? null,
  });

  const priority = (value: SlaDisplayResult): number => {
    if (value?.status === "overdue") {
      return 0;
    }
    return 1;
  };

  const slaDiff = priority(aSla) - priority(bSla);
  if (slaDiff !== 0) {
    return slaDiff;
  }

  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}
