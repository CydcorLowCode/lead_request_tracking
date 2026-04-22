-- AT&T import UI: sheet name on import run, partial index for unresolved badge, match_status error_deleted.

ALTER TABLE public.lrt_imports
  ADD COLUMN IF NOT EXISTS sheet_name text;

CREATE INDEX IF NOT EXISTS lrt_import_rows_unresolved_idx
  ON public.lrt_import_rows (import_id)
  WHERE match_status = 'ambiguous_unresolved';

-- Allow soft-deleting error rows (extend CHECK if present).
ALTER TABLE public.lrt_import_rows
  DROP CONSTRAINT IF EXISTS lrt_import_rows_match_status_check;

ALTER TABLE public.lrt_import_rows
  ADD CONSTRAINT lrt_import_rows_match_status_check
  CHECK (
    match_status = ANY (
      ARRAY[
        'pending',
        'matched',
        'unchanged',
        'new',
        'ambiguous_unresolved',
        'ambiguous_resolved',
        'ambiguous_deleted',
        'error',
        'error_deleted',
        'applied'
      ]::text[]
    )
  );
