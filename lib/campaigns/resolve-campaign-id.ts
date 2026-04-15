import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

export async function resolveCampaignIdBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("lrt_campaigns")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data.id;
}

export async function getCampaignBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Tables<"lrt_campaigns"> | null> {
  const { data, error } = await supabase
    .from("lrt_campaigns")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data;
}
