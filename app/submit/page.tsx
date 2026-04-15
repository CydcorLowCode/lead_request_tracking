import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/get-session-user";
import { ATT_CAMPAIGN_SLUG } from "@/lib/campaigns/constants";
import {
  getLeadTypeOptions,
  parseCampaignConfig,
} from "@/lib/campaigns/parse-config";
import { getCampaignBySlug } from "@/lib/campaigns/resolve-campaign-id";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { SubmitForm } from "./submit-form";

export default async function SubmitPage() {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (ctx.profile.role !== "owner" && ctx.profile.role !== "territory_team") {
    redirect("/login");
  }

  const supabase = await createClient();
  const campaign = await getCampaignBySlug(supabase, ATT_CAMPAIGN_SLUG);
  const parsedConfig = campaign ? parseCampaignConfig(campaign.config) : {};
  const leadTypes = getLeadTypeOptions(parsedConfig);
  const defaultAreaType = parsedConfig.area_types?.[0] ?? "market";

  if (!campaign || !campaign.is_active) {
    return (
      <PageShell title="New Lead Request">
        <p className="text-sm text-[var(--status-amber)]">
          AT&T Residential campaign is not available.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell title="New Lead Request">
      <SubmitForm
        campaignId={campaign.id}
        campaignName={campaign.name}
        leadTypes={leadTypes}
        defaultAreaType={defaultAreaType}
        sessionRole={ctx.profile.role}
        sessionProfileId={ctx.profile.id}
        sessionOwnerName={ctx.profile.full_name ?? ctx.profile.email}
        sessionOwnerDealerCode={ctx.profile.dealer_code ?? ""}
      />
    </PageShell>
  );
}
