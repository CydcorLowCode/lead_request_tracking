import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

export type ImportListRow = {
  import: Tables<"lrt_imports"> & { uploader_name: string | null };
  rowCounts: Record<string, number>;
  totalRows: number;
};

function aggregateBuckets(rows: { match_status: string }[]): { buckets: Record<string, number>; total: number } {
  const buckets: Record<string, number> = {};
  for (const r of rows) {
    const k = r.match_status;
    buckets[k] = (buckets[k] ?? 0) + 1;
  }
  return { buckets, total: rows.length };
}

export async function fetchImportListWithBuckets(
  supabase: SupabaseClient<Database>,
  opts: { limit: number; offset: number },
): Promise<ImportListRow[]> {
  const { data: imports, error } = await supabase
    .from("lrt_imports")
    .select("*")
    .order("created_at", { ascending: false })
    .range(opts.offset, opts.offset + opts.limit - 1);

  if (error || !imports?.length) {
    return [];
  }

  const uploaderIds = [...new Set(imports.map((i) => i.created_by))];
  const { data: profiles } = await supabase
    .from("lrt_profiles")
    .select("id, full_name, email")
    .in("id", uploaderIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name?.trim() || p.email || null]));

  const importIds = imports.map((i) => i.id);
  const { data: allRows } = await supabase
    .from("lrt_import_rows")
    .select("import_id, match_status")
    .in("import_id", importIds);

  const byImport = new Map<string, { match_status: string }[]>();
  for (const r of allRows ?? []) {
    const list = byImport.get(r.import_id) ?? [];
    list.push(r);
    byImport.set(r.import_id, list);
  }

  return imports.map((imp) => {
    const rows = byImport.get(imp.id) ?? [];
    const { buckets, total } = aggregateBuckets(rows);
    return {
      import: { ...imp, uploader_name: nameById.get(imp.created_by) ?? null },
      rowCounts: buckets,
      totalRows: total,
    };
  });
}

export async function countImports(supabase: SupabaseClient<Database>): Promise<number> {
  const { count } = await supabase.from("lrt_imports").select("*", { count: "exact", head: true });
  return count ?? 0;
}
