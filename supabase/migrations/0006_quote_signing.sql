-- Add electronic signature fields to quotes
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS signing_token  uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS signed_at      timestamptz,
  ADD COLUMN IF NOT EXISTS signature_data text,
  ADD COLUMN IF NOT EXISTS signer_name    text;

-- Backfill any quotes that somehow got a NULL token
UPDATE quotes SET signing_token = gen_random_uuid() WHERE signing_token IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS quotes_signing_token_idx ON quotes (signing_token);
