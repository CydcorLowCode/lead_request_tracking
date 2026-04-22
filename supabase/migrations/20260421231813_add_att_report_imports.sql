-- ============================================================================
-- AT&T Report Import Tables
-- ----------------------------------------------------------------------------
-- Stores import runs and per-row staging data so the territory team can:
--   1. Preview matches/conflicts before committing writes
--   2. Resolve ambiguous matches inline during the import
--   3. Skip ambiguous rows and revisit them later via an Unresolved tab
--   4. Audit what each import changed (full traceability)
--
-- Territory team only. Owners have no access.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- lrt_imports: one row per import run
-- ---------------------------------------------------------------------------
CREATE TABLE lrt_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES lrt_campaigns(id) ON DELETE RESTRICT,
  uploaded_by uuid NOT NULL REFERENCES lrt_profiles(id) ON DELETE RESTRICT,
  uploaded_at timestamptz NOT NULL DEFAULT now(),

  -- Source file metadata
  source_filename text NOT NULL,
  source_sheet_name text,  -- e.g. ""NAM REQUESTS"" for AT&T
  source_row_count integer NOT NULL DEFAULT 0,

  -- Lifecycle
  --   parsing   -> server is reading the file
  --   preview   -> parsed + matched, awaiting territory team review
  --   committed -> Apply Import was clicked; writes have been applied
  --   cancelled -> territory team abandoned the import before committing
  status text NOT NULL DEFAULT 'parsing'
    CHECK (status IN ('parsing','preview','committed','cancelled')),

  -- Bucket counts (denormalized for fast summary rendering)
  total_rows integer NOT NULL DEFAULT 0,
  matched_count integer NOT NULL DEFAULT 0,        -- 1 candidate, will update
  updated_count integer NOT NULL DEFAULT 0,        -- subset of matched where fields actually differ
  new_count integer NOT NULL DEFAULT 0,            -- 0 candidates, will create
  unchanged_count integer NOT NULL DEFAULT 0,      -- matched but identical
  ambiguous_count integer NOT NULL DEFAULT 0,      -- 2+ candidates
  error_count integer NOT NULL DEFAULT 0,          -- parse/validation errors

  -- Post-commit outcomes
  applied_updates integer NOT NULL DEFAULT 0,
  applied_inserts integer NOT NULL DEFAULT 0,
  applied_resolved integer NOT NULL DEFAULT 0,     -- ambiguous rows manually resolved then applied
  skipped_ambiguous integer NOT NULL DEFAULT 0,    -- left unresolved at commit time
  committed_at timestamptz,
  committed_by uuid REFERENCES lrt_profiles(id) ON DELETE RESTRICT,

  notes text
);

CREATE INDEX lrt_imports_campaign_idx ON lrt_imports(campaign_id, uploaded_at DESC);
CREATE INDEX lrt_imports_status_idx ON lrt_imports(status) WHERE status IN ('parsing','preview');


-- ---------------------------------------------------------------------------
-- lrt_import_rows: one row per row from the uploaded sheet
-- ---------------------------------------------------------------------------
-- Ambiguous rows that are skipped at commit time stay here forever (with
-- status = 'ambiguous_unresolved') so the territory team can resolve or
-- delete them from the Unresolved tab later.
-- ---------------------------------------------------------------------------
CREATE TABLE lrt_import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id uuid NOT NULL REFERENCES lrt_imports(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES lrt_campaigns(id) ON DELETE RESTRICT,

  -- Position in the source file (1-indexed, excluding header row)
  source_row_number integer NOT NULL,

  -- Raw parsed fields from the incoming sheet, preserved exactly as received.
  -- The matcher reads from here; the UI renders the ""Incoming"" card from here.
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Normalized fields extracted from raw_data, used by the matcher.
  -- Denormalized onto the row so we can index them and so the Unresolved tab
  -- can render without re-parsing raw_data.
  norm_office text,
  norm_dealer_code text,
  norm_lead_type text,
  norm_lead_area text,           -- normalized concatenation of all area fields
  norm_lead_area_zips text[],    -- extracted 5-digit zips for overlap matching
  norm_submitted_date date,
  norm_att_confirmation_number text,
  norm_att_decision text,        -- 'approved' | 'denied' | 'pending' | other

  -- Match outcome after the matcher runs:
  --   matched              -> exactly 1 candidate, write on commit
  --   unchanged            -> exactly 1 candidate, no field differences
  --   new                  -> 0 candidates, will create a new lead request
  --   ambiguous_unresolved -> 2+ candidates, awaiting manual pick
  --   ambiguous_resolved   -> 2+ candidates, territory team picked one
  --   ambiguous_deleted    -> 2+ candidates, territory team deleted the row (soft)
  --   error                -> could not be processed (bad data, missing required fields)
  --   applied              -> terminal state; write was committed
  match_status text NOT NULL DEFAULT 'pending'
    CHECK (match_status IN (
      'pending',
      'matched',
      'unchanged',
      'new',
      'ambiguous_unresolved',
      'ambiguous_resolved',
      'ambiguous_deleted',
      'error',
      'applied'
    )),

  -- Which matching tier produced the result (for debugging and analytics)
  --   tier_1_confirmation_id -> exact match on att_confirmation_number
  --   tier_2_fields          -> field match, no confirmation ID present
  --   tier_3_backfill        -> field match; confirmation ID backfilled onto LRT record
  --   tier_dealer_tiebreak   -> Tier 2/3 returned 2+, dealer code narrowed to 1
  match_tier text
    CHECK (match_tier IN (
      'tier_1_confirmation_id',
      'tier_2_fields',
      'tier_3_backfill',
      'tier_dealer_tiebreak'
    )),

  -- Candidate LRT requests considered by the matcher.
  -- For matched/unchanged/ambiguous_resolved: contains the chosen request.
  -- For ambiguous_unresolved: contains all candidates, UI picker reads this.
  -- For new: empty array.
  -- Shape per element: { request_id, matched_fields: [...], score, submitted_date }
  candidate_request_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],

  -- The specific LRT request this row ended up linked to.
  -- Set when match_status is one of: matched, unchanged, ambiguous_resolved, applied.
  -- NULL for new (until applied), ambiguous_unresolved, ambiguous_deleted, error.
  linked_request_id uuid REFERENCES lrt_lead_requests(id) ON DELETE SET NULL,

  -- Resolution tracking (for ambiguous rows)
  resolved_by uuid REFERENCES lrt_profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,

  -- Soft delete tracking (for ambiguous rows the territory team chooses to discard)
  deleted_by uuid REFERENCES lrt_profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  delete_reason text,

  -- Terminal state tracking (set when writes land in lrt_lead_requests)
  applied_at timestamptz,

  -- Error details when match_status = 'error'
  error_message text,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (import_id, source_row_number)
);

-- Indexes driving the UI views
CREATE INDEX lrt_import_rows_import_idx ON lrt_import_rows(import_id);
CREATE INDEX lrt_import_rows_unresolved_idx
  ON lrt_import_rows(campaign_id, created_at DESC)
  WHERE match_status = 'ambiguous_unresolved';
CREATE INDEX lrt_import_rows_match_status_idx ON lrt_import_rows(import_id, match_status);
CREATE INDEX lrt_import_rows_linked_request_idx ON lrt_import_rows(linked_request_id)
  WHERE linked_request_id IS NOT NULL;

-- Index supporting the matcher's Tier 2/3 field lookup
CREATE INDEX lrt_import_rows_matcher_lookup_idx
  ON lrt_import_rows(campaign_id, norm_office, norm_lead_type, norm_submitted_date);


-- ---------------------------------------------------------------------------
-- RLS: territory team only
-- ---------------------------------------------------------------------------
ALTER TABLE lrt_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrt_import_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY lrt_imports_all_tt
  ON lrt_imports
  FOR ALL
  TO authenticated
  USING (lrt_is_territory_team())
  WITH CHECK (lrt_is_territory_team());

CREATE POLICY lrt_import_rows_all_tt
  ON lrt_import_rows
  FOR ALL
  TO authenticated
  USING (lrt_is_territory_team())
  WITH CHECK (lrt_is_territory_team());


-- ---------------------------------------------------------------------------
-- Comments for future maintainers
-- ---------------------------------------------------------------------------
COMMENT ON TABLE lrt_imports IS
  'One row per AT&T report import run. Tracks upload, preview, commit, and bucket counts.';

COMMENT ON TABLE lrt_import_rows IS
  'Staging table for each row of an imported sheet. Stores raw + normalized data, matcher decision, candidate requests, and resolution/deletion audit trail. Ambiguous rows skipped at commit persist here for later resolution via the Unresolved tab.';

COMMENT ON COLUMN lrt_import_rows.match_status IS
  'Lifecycle of this row through matcher + territory team review. See CHECK constraint for full state list.';

COMMENT ON COLUMN lrt_import_rows.candidate_request_ids IS
  'UUIDs of candidate lrt_lead_requests found by the matcher. For ambiguous_unresolved rows, this drives the picker UI.';

COMMENT ON COLUMN lrt_import_rows.norm_lead_area_zips IS
  'Array of 5-digit ZIP codes extracted from the lead area field. Used by the matcher for zip-overlap matching when exact normalized strings don''t match.';"
