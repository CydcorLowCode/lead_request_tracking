-- 1. Add new columns to lrt_lead_requests
ALTER TABLE lrt_lead_requests
  ADD COLUMN IF NOT EXISTS approved_zip_codes text,
  ADD COLUMN IF NOT EXISTS denied_zip_codes    text,
  ADD COLUMN IF NOT EXISTS admin_submitted      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_submitted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS admin_submitted_by   uuid REFERENCES lrt_profiles(id) ON DELETE SET NULL;

-- 2. Create lrt_notifications table
CREATE TABLE IF NOT EXISTS lrt_notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES lrt_profiles(id) ON DELETE CASCADE,
  request_id  uuid REFERENCES lrt_lead_requests(id) ON DELETE CASCADE,
  trigger     text NOT NULL,
  message     text NOT NULL,
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS lrt_notifications_user_id_idx
  ON lrt_notifications(user_id);
CREATE INDEX IF NOT EXISTS lrt_notifications_request_id_idx
  ON lrt_notifications(request_id);
CREATE INDEX IF NOT EXISTS lrt_notifications_read_idx
  ON lrt_notifications(user_id, read) WHERE read = false;

-- 4. RLS
ALTER TABLE lrt_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications: owner reads own"
  ON lrt_notifications FOR SELECT
  USING (user_id = auth.uid());

-- Territory team can insert notifications for any user
CREATE POLICY "notifications: territory_team insert"
  ON lrt_notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lrt_profiles
      WHERE id = auth.uid() AND role = 'territory_team'
    )
  );

-- Users can mark their own notifications as read
CREATE POLICY "notifications: owner updates own"
  ON lrt_notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Edge functions use the service role so they bypass RLS — no additional policy needed.
