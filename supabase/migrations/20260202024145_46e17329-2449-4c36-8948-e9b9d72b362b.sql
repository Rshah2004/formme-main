-- Allow manufacturers to view techpacks for orders they're assigned to (including pending)
CREATE POLICY "Manufacturers can view techpacks for their orders"
ON public.techpacks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN manufacturers m ON m.id = o.manufacturer_id
    WHERE o.design_id = techpacks.design_id
    AND m.user_id = auth.uid()
  )
);

-- Allow manufacturers to view design specs for orders they're assigned to
CREATE POLICY "Manufacturers can view design specs for their orders"
ON public.design_specs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN manufacturers m ON m.id = o.manufacturer_id
    WHERE o.design_id = design_specs.design_id
    AND m.user_id = auth.uid()
  )
);