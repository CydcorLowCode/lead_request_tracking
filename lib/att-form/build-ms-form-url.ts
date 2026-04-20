const MS_FORMS_BASE =
  "https://forms.office.com/Pages/ResponsePage.aspx?id=HNdB57bGsEeAPA87MrB1VlEkObXQ4u5EpnugCclqPoxUQVcyRFVPMVBWNEdFOUZNVjNDMjNMMUVEUSQlQCN0PWcu";

const F = {
  territoryLine: "r9b9472872d054560aae35f97195cd818",
  staticEmail: "ree2b900cbcaf4f6a932963512ba3efc9",
  ownerFullName: "ra294fc13e0724e08a381f073736c8d6b",
  ownerPhone: "rc0cb5a9ee907463e9a50ce1314bc61b1",
  ownerEmail: "reaf1e9a2703240429fb31e2946ed1723",
  submittedAt: "r68c3b106638a41c59f17159d286387f8",
  officeName: "rcfe26bd9e024438ab3ce12d2a6451d24",
  dealerCode: "r4c83c9327fd144d9a62ec4f8b6cc301f",
  dateNeededBy: "r87050a717e924fb68f0606a9e8b8a7a4",
  headcount: "r0f76abcec82344c2b538fc1ec5f6db26",
  state: "rc6f114f93816424cadd7cf3a6adc582d",
  dma: "r80e33a3048504778827a6a04c39fed6a",
  leadTypeLabel: "r0807cfb799054e3c8a2a692cc3828f49",
} as const;

const LEAD_TYPE_MS_FORM_LABEL: Record<string, string> = {
  permanent_assignment: "SLA 10 - Additional Leads",
  business_trip: "SLA 10 - 30 Days Road Trip/Seasonal",
  nlt_new_fiber: "SLA 2 - Weekly New Fiber Road Trip",
  market_proposal: "Market Proposal",
  oof_wireless: "OOF/Wireless",
  pullback: "Pullback/No Longer Needed",
};

const STATE_CODE_TO_NAME: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
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
  territoryManagerFullName: string;
  submittedAt: Date;
};

function normalizePhone10(raw: string | null): string | null {
  if (raw == null) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(-10);
  }
  if (digits.length === 10) {
    return digits;
  }
  return null;
}

function formatSubmittedAt(date: Date): string {
  const s = date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return s.replace(/, (\d{1,2}:\d{2})/, " at $1");
}

function formatDateNeededByLong(yyyyMmDd: string): string {
  const d = new Date(`${yyyyMmDd}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function setIfNonEmpty(url: URL, key: string, value: string | null | undefined) {
  if (value == null) return;
  const t = value.trim();
  if (t.length === 0) return;
  url.searchParams.set(key, t);
}

/** MS Forms expect full state names; accept legacy 2-letter codes or full names. */
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

export function buildMsFormUrl(input: BuildMsFormUrlInput): string {
  const url = new URL(MS_FORMS_BASE);

  const tm = input.territoryManagerFullName.trim();
  if (tm.length > 0) {
    url.searchParams.set(F.territoryLine, `CYDCOR - ${tm.toUpperCase()}`);
  }

  url.searchParams.set(F.staticEmail, "ATTleads@cydcor.com");

  setIfNonEmpty(url, F.ownerFullName, input.ownerFullName);
  setIfNonEmpty(url, F.ownerEmail, input.ownerEmail);

  const phone10 = normalizePhone10(input.ownerPhone);
  if (phone10) {
    url.searchParams.set(F.ownerPhone, phone10);
  }

  url.searchParams.set(F.submittedAt, formatSubmittedAt(input.submittedAt));

  const office =
    input.ownerLegalCorpName?.trim() ||
    input.ownerOfficeName?.trim() ||
    null;
  setIfNonEmpty(url, F.officeName, office);

  setIfNonEmpty(url, F.dealerCode, input.dealerCode);

  if (input.dateNeededBy?.trim()) {
    url.searchParams.set(
      F.dateNeededBy,
      formatDateNeededByLong(input.dateNeededBy.trim()),
    );
  }

  url.searchParams.set(F.headcount, "10");

  const stateFull = resolveStateForMsForm(input.state);
  setIfNonEmpty(url, F.state, stateFull);

  setIfNonEmpty(url, F.dma, input.dma);

  const leadLabel = LEAD_TYPE_MS_FORM_LABEL[input.leadType];
  setIfNonEmpty(url, F.leadTypeLabel, leadLabel);

  return url.toString();
}
