"use client";

import { type FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { submitLeadRequestAction } from "@/app/submit/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import type { LrtProfileRole } from "@/types/database";

type LeadTypeOption = {
  value: string;
  label: string;
};

type SubmitFormProps = {
  campaignId: string;
  campaignName: string;
  leadTypes: LeadTypeOption[];
  defaultAreaType: string;
  sessionRole: LrtProfileRole;
  sessionProfileId: string;
  sessionOwnerName: string;
  sessionOwnerDealerCode: string;
};

type OwnerOption = {
  id: string;
  name: string;
  dealerCode: string;
};

type DmaOption = {
  id: string;
  dmaName: string;
  isWarning: boolean;
};

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const ZIP_REQUIRED_LEAD_TYPES = new Set([
  "permanent_assignment",
  "nlt_new_fiber",
]);

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--secondary)]">
        {title}
      </div>
      <div className="h-px w-full bg-[var(--border)]" />
    </div>
  );
}

export function SubmitForm({
  campaignId,
  campaignName,
  leadTypes,
  defaultAreaType,
  sessionRole,
  sessionProfileId,
  sessionOwnerName,
  sessionOwnerDealerCode,
}: SubmitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [ownerOptions, setOwnerOptions] = useState<OwnerOption[]>([]);
  const [dmaOptions, setDmaOptions] = useState<DmaOption[]>([]);
  const [isOwnerLoading, setIsOwnerLoading] = useState(sessionRole === "territory_team");
  const [isDmaLoading, setIsDmaLoading] = useState(true);

  const [leadType, setLeadType] = useState(leadTypes[0]?.value ?? "");
  const [ownerId, setOwnerId] = useState(
    sessionRole === "owner" ? sessionProfileId : "",
  );
  const [dealerCode, setDealerCode] = useState(
    sessionRole === "owner" ? sessionOwnerDealerCode : "",
  );
  const [dma, setDma] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [requestedLocation, setRequestedLocation] = useState("");
  const [zipCodes, setZipCodes] = useState("");
  const [dateNeededBy, setDateNeededBy] = useState("");
  const [isReserve, setIsReserve] = useState(false);
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zipWarning, setZipWarning] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadOwners() {
      if (sessionRole !== "territory_team") {
        return;
      }
      setIsOwnerLoading(true);
      const { data } = await supabase
        .from("lrt_profiles")
        .select("id, full_name, email, dealer_code")
        .eq("role", "owner")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      setOwnerOptions(
        (data ?? []).map((owner) => ({
          id: owner.id,
          name: owner.full_name ?? owner.email,
          dealerCode: owner.dealer_code ?? "",
        })),
      );
      setIsOwnerLoading(false);
    }

    async function loadDmas() {
      setIsDmaLoading(true);
      const { data } = await supabase
        .from("lrt_dmas")
        .select("id, dma_name, is_warning")
        .eq("campaign_id", campaignId)
        .order("dma_name", { ascending: true });

      setDmaOptions(
        (data ?? []).map((item) => ({
          id: item.id,
          dmaName: item.dma_name,
          isWarning: item.is_warning,
        })),
      );
      setIsDmaLoading(false);
    }

    void loadOwners();
    void loadDmas();
  }, [campaignId, sessionRole]);

  const selectedDma = useMemo(
    () => dmaOptions.find((option) => option.dmaName === dma),
    [dma, dmaOptions],
  );
  const isZipVisible = ZIP_REQUIRED_LEAD_TYPES.has(leadType);
  const ownerLabel =
    sessionRole === "owner"
      ? sessionOwnerName
      : ownerOptions.find((owner) => owner.id === ownerId)?.name ?? "";

  async function validateZipWarnings() {
    if (!isZipVisible || !zipCodes.trim()) {
      setZipWarning(null);
      return;
    }
    const zips = Array.from(
      new Set(zipCodes.match(/\b\d{5}\b/g) ?? []),
    );
    if (zips.length === 0) {
      setZipWarning(null);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("lrt_no_coverage_zips")
      .select("zip_code")
      .eq("campaign_id", campaignId)
      .in("zip_code", zips);

    if ((data ?? []).length > 0) {
      const denied = (data ?? []).map((row) => row.zip_code).join(", ");
      setZipWarning(`Warning: no coverage listed for zip(s): ${denied}.`);
    } else {
      setZipWarning(null);
    }
  }

  function validateFields() {
    const nextErrors: Record<string, string> = {};
    if (!leadType) nextErrors.leadType = "Lead type is required.";
    if (!ownerId) nextErrors.ownerId = "Office is required.";
    if (!dealerCode.trim()) nextErrors.dealerCode = "Dealer code is required.";
    if (!dma) nextErrors.dma = "DMA is required.";
    if (!requestedLocation.trim()) {
      nextErrors.requestedLocation = "Lead area requested is required.";
    }
    if (!dateNeededBy) nextErrors.dateNeededBy = "Date needed by is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleCancel() {
    if (sessionRole === "territory_team") {
      router.push("/dashboard");
      return;
    }
    router.push("/my-requests");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGlobalError(null);
    if (!validateFields()) {
      return;
    }

    startTransition(async () => {
      const result = await submitLeadRequestAction({
        campaignId,
        defaultAreaType,
        ownerId,
        leadType,
        dealerCode,
        dma,
        state: stateCode,
        requestedLocation,
        zipCodes: isZipVisible ? zipCodes : "",
        dateNeededBy,
        isReserve,
        notes,
      });

      if (!result.ok) {
        if (result.errors) {
          setErrors(result.errors);
        }
        setGlobalError(result.message ?? "Unable to submit your request.");
        return;
      }

      toast.success("Request submitted successfully");
      router.push(result.redirectTo ?? "/my-requests");
      router.refresh();
    });
  }

  function handleOwnerSelect(nextOwnerId: string) {
    setOwnerId(nextOwnerId);
    const selectedOwner = ownerOptions.find((owner) => owner.id === nextOwnerId);
    if (selectedOwner) {
      setDealerCode(selectedOwner.dealerCode);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-4">
      <div className="flex items-end justify-between rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            New Lead Request
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-[var(--secondary)]">{campaignName}</p>
          <ThemeToggle />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <SectionHeading title="Lead Type" />
              <div className="space-y-2">
                <Label htmlFor="leadType">Lead Type</Label>
                <Select
                  id="leadType"
                  value={leadType}
                  onChange={(event) => setLeadType(event.target.value)}
                  options={leadTypes.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
                {errors.leadType ? (
                  <p className="text-sm text-[var(--status-red)]">{errors.leadType}</p>
                ) : null}
              </div>
            </section>

            <section>
              <SectionHeading title="Owner and Office" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="owner">Office Name</Label>
                  {sessionRole === "owner" ? (
                    <Input id="owner" value={ownerLabel} readOnly />
                  ) : isOwnerLoading ? (
                    <Skeleton />
                  ) : (
                    <Combobox
                      value={ownerId}
                      onChange={handleOwnerSelect}
                      options={ownerOptions.map((owner) => ({
                        value: owner.id,
                        label: owner.name,
                      }))}
                      placeholder="Select office name"
                      searchPlaceholder="Search offices..."
                      emptyText="No active owners found."
                    />
                  )}
                  {errors.ownerId ? (
                    <p className="text-sm text-[var(--status-red)]">{errors.ownerId}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealerCode">Dealer Code</Label>
                  <Input
                    id="dealerCode"
                    value={dealerCode}
                    onChange={(event) => setDealerCode(event.target.value)}
                    className="font-mono"
                  />
                  {errors.dealerCode ? (
                    <p className="text-sm text-[var(--status-red)]">
                      {errors.dealerCode}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section>
              <SectionHeading title="Location Details" />
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dma">DMA</Label>
                    {isDmaLoading ? (
                      <Skeleton />
                    ) : (
                      <Combobox
                        value={dma}
                        onChange={setDma}
                        options={dmaOptions.map((item) => ({
                          value: item.dmaName,
                          label: item.dmaName,
                        }))}
                        placeholder="Select DMA"
                        searchPlaceholder="Search DMA..."
                        emptyText="No DMA options found."
                      />
                    )}
                    {errors.dma ? (
                      <p className="text-sm text-[var(--status-red)]">{errors.dma}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      id="state"
                      value={stateCode}
                      onChange={(event) => setStateCode(event.target.value)}
                      placeholder="Select state"
                      options={STATES.map((state) => ({ value: state, label: state }))}
                    />
                  </div>
                </div>

                {selectedDma?.isWarning ? (
                  <div className="rounded-[6px] border border-[var(--status-amber)]/40 bg-[var(--status-amber)]/10 px-3 py-2 text-sm text-[var(--status-amber)]">
                    This is a closed AT&amp;T market. Your request may be denied.
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="requestedLocation">Lead Area Requested</Label>
                  <Input
                    id="requestedLocation"
                    value={requestedLocation}
                    onChange={(event) => setRequestedLocation(event.target.value)}
                    placeholder="Market ex. Venice, California  |  Zip ex. 90291"
                  />
                  {errors.requestedLocation ? (
                    <p className="text-sm text-[var(--status-red)]">
                      {errors.requestedLocation}
                    </p>
                  ) : null}
                </div>

                {isZipVisible ? (
                  <div className="space-y-2">
                    <Label htmlFor="zipCodes">Zip Codes</Label>
                    <Textarea
                      id="zipCodes"
                      value={zipCodes}
                      onChange={(event) => setZipCodes(event.target.value)}
                      onBlur={validateZipWarnings}
                      className="font-mono"
                      placeholder={"90001, 90002, 90003\nor one zip per line"}
                    />
                    {zipWarning ? (
                      <p className="text-sm text-[var(--status-amber)]">{zipWarning}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="dateNeededBy">Date Needed By</Label>
                  <Input
                    id="dateNeededBy"
                    type="date"
                    value={dateNeededBy}
                    onChange={(event) => setDateNeededBy(event.target.value)}
                  />
                  {errors.dateNeededBy ? (
                    <p className="text-sm text-[var(--status-red)]">
                      {errors.dateNeededBy}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section>
              <SectionHeading title="Options" />
              <label className="flex w-full items-start gap-3 rounded-[6px] border border-[var(--border)] bg-[var(--input)] px-3 py-3">
                <input
                  type="checkbox"
                  checked={isReserve}
                  onChange={(event) => setIsReserve(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--accent)]"
                />
                <span>
                  <span className="block text-sm font-medium text-[var(--foreground)]">
                    Company Reserves
                  </span>
                  <span className="block text-sm text-[var(--secondary)]">
                    Auto-approved - excluded from approval rate metrics
                  </span>
                </span>
              </label>
            </section>

            <section>
              <SectionHeading title="Notes" />
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add context for approvers (optional)"
                />
              </div>
            </section>

            {globalError ? (
              <p className="text-sm text-[var(--status-red)]">{globalError}</p>
            ) : null}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[var(--border)] bg-transparent px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--border-hover)]"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </button>
              <Button type="submit" className="w-auto px-5" disabled={isPending}>
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden="true"
                    />
                    Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
