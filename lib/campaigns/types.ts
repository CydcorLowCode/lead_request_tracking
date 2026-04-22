import type { Json } from "@/types/database";

export type CampaignLeadTypeConfig = {
  value: string;
  label: string;
  sla_hours?: number;
  territory_team_only?: boolean;
};

export type CampaignConfig = {
  lead_types?: CampaignLeadTypeConfig[];
  area_types?: string[];
  coverage_check?: boolean;
};

export function isCampaignConfig(value: Json): value is CampaignConfig {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
