ALTER TABLE offers
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN offers.expires_at IS 'Optional expiration timestamp for the offer';
