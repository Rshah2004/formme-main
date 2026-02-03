-- Add shipping confirmation fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS shipping_tracking_number text,
ADD COLUMN IF NOT EXISTS shipping_carton_count integer,
ADD COLUMN IF NOT EXISTS shipping_terms text,
ADD COLUMN IF NOT EXISTS shipping_notes text;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.shipping_confirmed_at IS 'Timestamp when manufacturer confirmed shipping details';
COMMENT ON COLUMN public.orders.shipping_tracking_number IS 'Shipment tracking number';
COMMENT ON COLUMN public.orders.shipping_carton_count IS 'Number of cartons in shipment';
COMMENT ON COLUMN public.orders.shipping_terms IS 'Shipping terms (FOB, CIF, EXW, DAP, DDP)';
COMMENT ON COLUMN public.orders.shipping_notes IS 'Additional shipping notes';