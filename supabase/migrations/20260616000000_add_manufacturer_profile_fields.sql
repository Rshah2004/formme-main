ALTER TABLE manufacturers
ADD COLUMN IF NOT EXISTS notable_brands text[],
ADD COLUMN IF NOT EXISTS photo_urls text[],
ADD COLUMN IF NOT EXISTS turnover text;
