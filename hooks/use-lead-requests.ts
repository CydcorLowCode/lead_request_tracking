"use client";

import { useCallback, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type LeadRequestRow = Tables<"lrt_lead_requests">;

/**
 * Client hook scaffold for listing lead requests; extend with filters and realtime as needed.
 */
export function useLeadRequests() {
  const [rows, setRows] = useState<LeadRequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: qError } = await supabase
      .from("lrt_lead_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (qError) {
      setError(qError.message);
      setRows([]);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }, []);

  return { rows, loading, error, refresh };
}
