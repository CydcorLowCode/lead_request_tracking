-- Allow auth_user_id to be null for pre-provisioned owners not yet logged in
ALTER TABLE lrt_profiles ALTER COLUMN auth_user_id DROP NOT NULL;

-- Add unique constraint on email for upsert support
ALTER TABLE lrt_profiles ADD CONSTRAINT lrt_profiles_email_key UNIQUE (email);

-- Also add unique constraint on sf_contact_id for future Salesforce sync
ALTER TABLE lrt_profiles ADD CONSTRAINT lrt_profiles_sf_contact_id_key UNIQUE (sf_contact_id);;
