#!/usr/bin/env node
/**
 * Bulk-load reference rows with service role (bypasses RLS).
 *
 * Usage:
 *   node --env-file=.env.local scripts/load-reference-data.mjs dmas ./path/to/dmas.csv
 *   node --env-file=.env.local scripts/load-reference-data.mjs zips ./path/to/no_coverage_zips.csv
 *
 * CSV headers (first row):
 *   dmas: dma_name,market,state,is_warning  (optional columns may be empty)
 *   zips: zip_code,city,state
 *
 * `campaign_id` is resolved from `lrt_campaigns.slug = 'att'`.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const ATT_SLUG = "att";

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

async function main() {
  const [, , kind, filePath] = process.argv;
  if (!kind || !filePath || !["dmas", "zips"].includes(kind)) {
    console.error(
      "Usage: node scripts/load-reference-data.mjs <dmas|zips> <csv-path>",
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: campaign, error: campError } = await supabase
    .from("lrt_campaigns")
    .select("id")
    .eq("slug", ATT_SLUG)
    .maybeSingle();

  if (campError || !campaign) {
    console.error("Could not resolve campaign id for slug", ATT_SLUG, campError);
    process.exit(1);
  }

  const campaignId = campaign.id;
  const raw = readFileSync(filePath, "utf8");
  const { rows } = parseCsv(raw);

  if (kind === "dmas") {
    const payload = rows.map((r) => ({
      campaign_id: campaignId,
      dma_name: r.dma_name,
      market: r.market || null,
      state: r.state || null,
      is_warning: String(r.is_warning).toLowerCase() === "true",
    }));
    const { error } = await supabase.from("lrt_dmas").insert(payload);
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(`Inserted ${payload.length} DMA rows.`);
  } else {
    const payload = rows.map((r) => ({
      campaign_id: campaignId,
      zip_code: r.zip_code,
      city: r.city || null,
      state: r.state || null,
    }));
    const { error } = await supabase.from("lrt_no_coverage_zips").insert(payload);
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(`Inserted ${payload.length} zip rows.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
