ALTER TABLE public.design_specs
ADD COLUMN IF NOT EXISTS hoodie_editor_state JSONB DEFAULT '{}'::jsonb;
