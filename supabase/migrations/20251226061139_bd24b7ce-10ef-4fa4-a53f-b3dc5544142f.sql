-- Add tech_pack_feasibility fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tech_pack_feasible boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tech_pack_feasibility_confirmed_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tech_pack_feasibility_notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tech_pack_checklist jsonb DEFAULT NULL;