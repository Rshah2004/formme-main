-- Allow manufacturers to view profiles of designers they have orders with
CREATE POLICY "Manufacturers can view designer profiles for their orders"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM orders o
    JOIN manufacturers m ON m.id = o.manufacturer_id
    WHERE o.designer_id = profiles.user_id
    AND m.user_id = auth.uid()
  )
);

-- Allow designers to view profiles of manufacturers they have orders with
CREATE POLICY "Designers can view manufacturer profiles for their orders"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM orders o
    JOIN manufacturers m ON m.id = o.manufacturer_id
    WHERE m.user_id = profiles.user_id
    AND o.designer_id = auth.uid()
  )
);