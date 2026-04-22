const MS_FORMS_BASE =
  "https://forms.office.com/Pages/ResponsePage.aspx?id=HNdB57bGsEeAPA87MrB1VlEkObXQ4u5EpnugCclqPoxUQVcyRFVPMVBWNEdFOUZNVjNDMjNMMUVEUSQlQCN0PWcu";

const F = {
  dealerName: "r9b9472872d054560aae35f97195cd818",
  submitterEmail: "ree2b900cbcaf4f6a932963512ba3efc9",
  submitterName: "ra294fc13e0724e08a381f073736c8d6b",
  submitterCbr: "rc0cb5a9ee907463e9a50ce1314bc61b1",
  leadsAdminEmail: "reaf1e9a2703240429fb31e2946ed1723",
  submittedDate: "r68c3b106638a41c59f17159d286387f8",
  subDealer: "rcfe26bd9e024438ab3ce12d2a6451d24",
  dealerCode: "r4c83c9327fd144d9a62ec4f8b6cc301f",
  launchDateNeeded: "r87050a717e924fb68f0606a9e8b8a7a4",
  headcount: "r0f76abcec82344c2b538fc1ec5f6db26",
  state: "rc6f114f93816424cadd7cf3a6adc582d",
  dma: "r80e33a3048504778827a6a04c39fed6a",
  leadType: "r0807cfb799054e3c8a2a692cc3828f49",
} as const;

const LEAD_TYPE_MS_FORM_LABEL: Record<string, string> = {
  // Existing 6 — labels corrected to match the AT&T form exactly
  permanent_assignment: "SLA 10 - Additional Leads - Incumbent Sub-Dealer",
  business_trip: "SLA 10 - 30 Days Road Trip/Seasonal",
  nlt_new_fiber: "SLA 2 - Weekly Unassigned New Fiber Road Trip",
  market_proposal: "SLA 10 - Market Proposal/Zip Code List (Check DMA availability in MOR Report)",
  oof_wireless: "SLA 10 - OOF WIRELESS",
  pullback: "Pullback/Remove Zip Code",

  // New 6 — territory-team-only lead types
  oof_aia_wireless: "SLA 10 - OOF - AIA/WIRELESS",
  qa_pullback_permit: "QA PULLBACK - NOT MEETING PERMIT REQ",
  mdu_acc: "SLA 10 - MDU/ACC Program",
  office_closure: "Office Closure",
  natural_disaster: "Natural Disaster",
  no_solicitation: "SLA 10 - No Solicitation, Violation of Local Solicitation",
};

const STATE_CODE_TO_NAME: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export type BuildMsFormUrlInput = {
  leadType: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string | null;
  ownerOfficeName: string | null;
  ownerLegalCorpName: string | null;
  dealerCode: string;
  dateNeededBy: string | null;
  state: string;
  dma: string;
  leadAreaRequested: string;
  submittedAt: Date;
};

function normalizePhone10(raw: string | null): string | null {
  if (raw == null) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(-10);
  if (digits.length === 10) return digits;
  return null;
}

/** MS Forms date fields require M/d/yyyy with no leading zeros (e.g. 4/9/2026). */
function formatDateMdYyyy(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}

/** Parse yyyy-MM-dd at noon UTC to avoid timezone rollover, format as M/d/yyyy. */
function formatYyyyMmDdAsMdYyyy(yyyyMmDd: string): string {
  const parsed = new Date(`${yyyyMmDd}T12:00:00Z`);
  return formatDateMdYyyy(parsed);
}

/** MS Forms expect full state names; accept 2-letter codes or full names. */
function resolveStateForMsForm(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length === 2) {
    const fromCode = STATE_CODE_TO_NAME[trimmed.toUpperCase()];
    if (fromCode) return fromCode;
  }
  const lower = trimmed.toLowerCase();
  return Object.values(STATE_CODE_TO_NAME).find(
    (name) => name.toLowerCase() === lower,
  );
}

/**
 * Build a prefill query string where spaces are encoded as %20 (not +).
 * Microsoft Forms interprets `+` as a literal plus sign in prefill URLs,
 * so we cannot use URLSearchParams (which uses `+` for spaces).
 */
function buildPrefillQuery(params: Array<[string, string | null | undefined]>): string {
  const parts: string[] = [];
  for (const [key, value] of params) {
    if (value == null) continue;
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed.length === 0) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(trimmed)}`);
  }
  return parts.join("&");
}

export function buildMsFormUrl(input: BuildMsFormUrlInput): string {
  const office =
    input.ownerLegalCorpName?.trim() ||
    input.ownerOfficeName?.trim() ||
    null;

  const phone10 = normalizePhone10(input.ownerPhone);

  const dateNeededBy = input.dateNeededBy?.trim()
    ? formatYyyyMmDdAsMdYyyy(input.dateNeededBy.trim())
    : null;

  const stateFull = resolveStateForMsForm(input.state);
  const leadLabel = LEAD_TYPE_MS_FORM_LABEL[input.leadType];

  const params: Array<[string, string | null | undefined]> = [
    [F.dealerName, "CYDCOR"],
    [F.submitterEmail, "ATTleads@cydcor.com"],
    [F.submitterName, input.ownerFullName],
    [F.submitterCbr, phone10],
    [F.leadsAdminEmail, input.ownerEmail],
    [F.submittedDate, formatDateMdYyyy(input.submittedAt)],
    [F.subDealer, office],
    [F.dealerCode, input.dealerCode],
    [F.launchDateNeeded, dateNeededBy],
    [F.headcount, "10"],
    [F.state, stateFull],
    [F.dma, input.dma],
    [F.leadType, leadLabel],
  ];

  const query = buildPrefillQuery(params);
  return query.length > 0 ? `${MS_FORMS_BASE}&${query}` : MS_FORMS_BASE;
}
