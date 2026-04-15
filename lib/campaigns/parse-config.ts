import type { Json } from "@/types/database";

import {
  type CampaignConfig,
  type CampaignLeadTypeConfig,
  isCampaignConfig,
} from "./types";

export function parseCampaignConfig(config: Json): CampaignConfig {
  if (!isCampaignConfig(config)) {
    return {};
  }
  return config;
}

export function getLeadTypeOptions(
  config: CampaignConfig,
): CampaignLeadTypeConfig[] {
  return Array.isArray(config.lead_types) ? config.lead_types : [];
}
