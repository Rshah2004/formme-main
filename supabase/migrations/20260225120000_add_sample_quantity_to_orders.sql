-- Add sample_quantity to orders for sample requirements tracking
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS sample_quantity INTEGER;
