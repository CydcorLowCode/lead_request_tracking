import { describe, expect, it } from "vitest";

import {
  comparePeriods,
  computePeriodMetrics,
  filterCreatedInRange,
  previousRange,
  type LeadRequestForReport,
} from "./analytics";

function row(partial: Partial<LeadRequestForReport> & { id: string }): LeadRequestForReport {
  const base = {
    admin_submitted: false,
    admin_submitted_at: null,
    admin_submitted_by: null,
    approved_zip_codes: null,
    area_type: "zip" as const,
    att_confirmation_number: null,
    att_response_at: null,
    att_submitted_at: null,
    campaign_id: "c1",
    created_at: "2026-04-15T12:00:00.000Z",
    date_needed_by: null,
    dealer_code: null,
    decline_date: null,
    denied_zip_codes: null,
    dma: null,
    form_data: {},
    headcount: null,
    internal_notes: null,
    is_reserve: false,
    lead_area_requested: "78701",
    lead_area_requested_2: null,
    lead_area_requested_3: null,
    lead_area_requested_4: null,
    lead_area_requested_5: null,
    lead_type: "permanent_assignment",
    notes: null,
    notes_for_icl: null,
    office: null,
    owner_id: "o1",
    resolved_at: null,
    sf_visibility_date: null,
    sla_due_at: "2026-04-16T12:00:00.000Z",
    sla_status: "on_track" as const,
    status: "new" as const,
    submitted_by: "o1",
    submitted_on_behalf: false,
    updated_at: "2026-04-15T12:00:00.000Z",
  };
  return { ...base, ...partial } as LeadRequestForReport;
}

describe("computePeriodMetrics", () => {
  it("returns ratePct: null when there are no approval/denial decisions", () => {
    const m = computePeriodMetrics([
      row({ id: "1", status: "new" }),
      row({ id: "2", status: "submitted_to_client" }),
    ]);
    expect(m.approvalRate.ratePct).toBeNull();
    expect(m.approvalRate.decided).toBe(0);
  });

  it("excludes reserves from approval rate numerator and denominator", () => {
    const m = computePeriodMetrics([
      row({ id: "1", status: "visible_in_salesforce", is_reserve: false }),
      row({ id: "2", status: "declined", is_reserve: false }),
      row({ id: "3", status: "visible_in_salesforce", is_reserve: true }),
      row({ id: "4", status: "declined", is_reserve: true }),
    ]);
    expect(m.approvalRate.approved).toBe(1);
    expect(m.approvalRate.denied).toBe(1);
    expect(m.approvalRate.decided).toBe(2);
    expect(m.approvalRate.ratePct).toBe(50);
  });

  it("excludes unresolved rows from avg response time and SLA compliance", () => {
    const m = computePeriodMetrics([
      row({
        id: "1",
        created_at: "2026-04-15T12:00:00.000Z",
        resolved_at: null,
        sla_due_at: "2026-04-16T12:00:00.000Z",
        status: "new",
      }),
      row({
        id: "2",
        created_at: "2026-04-14T12:00:00.000Z",
        resolved_at: "2026-04-15T12:00:00.000Z",
        sla_due_at: "2026-04-16T12:00:00.000Z",
        status: "visible_in_salesforce",
      }),
    ]);
    expect(m.avgResponseHours).toBe(24);
    expect(m.slaCompliance.evaluated).toBe(1);
    expect(m.slaCompliance.compliant).toBe(1);
    expect(m.slaCompliance.ratePct).toBe(100);
  });
});

describe("previousRange", () => {
  it("returns a window of equal length immediately preceding the input", () => {
    const from = new Date("2026-04-01T00:00:00.000Z");
    const to = new Date("2026-04-11T00:00:00.000Z");
    const prev = previousRange({ from, to });
    expect(prev.to.getTime()).toBe(from.getTime());
    expect(prev.to.getTime() - prev.from.getTime()).toBe(to.getTime() - from.getTime());
    expect(prev.from.toISOString()).toBe("2026-03-22T00:00:00.000Z");
  });
});

describe("comparePeriods", () => {
  it("returns { kind: none } for approval/SLA when either side rate is null", () => {
    const a = computePeriodMetrics([row({ id: "1", status: "new" })]);
    const b = computePeriodMetrics([
      row({ id: "2", status: "visible_in_salesforce" }),
      row({ id: "3", status: "declined" }),
    ]);
    const d = comparePeriods(b, a);
    expect(d.approvalRatePct).toEqual({ kind: "none" });
    expect(d.slaCompliancePct).toEqual({ kind: "none" });
  });

  it("returns { kind: none } for avg response hours when either side is null", () => {
    const noResolved = computePeriodMetrics([row({ id: "1", status: "new", resolved_at: null })]);
    const withResolved = computePeriodMetrics([
      row({
        id: "2",
        created_at: "2026-04-14T12:00:00.000Z",
        resolved_at: "2026-04-15T12:00:00.000Z",
        status: "visible_in_salesforce",
      }),
    ]);
    expect(comparePeriods(withResolved, noResolved).avgResponseHours).toEqual({ kind: "none" });
    expect(comparePeriods(noResolved, withResolved).avgResponseHours).toEqual({ kind: "none" });
  });
});

describe("filterCreatedInRange", () => {
  it("includes rows whose created_at falls inside the range (inclusive)", () => {
    const r = [
      row({ id: "1", created_at: "2026-04-10T00:00:00.000Z" }),
      row({ id: "2", created_at: "2026-04-05T00:00:00.000Z" }),
    ];
    const from = new Date("2026-04-09T00:00:00.000Z");
    const to = new Date("2026-04-10T23:59:59.000Z");
    expect(filterCreatedInRange(r, { from, to }).map((x) => x.id)).toEqual(["1"]);
  });
});
