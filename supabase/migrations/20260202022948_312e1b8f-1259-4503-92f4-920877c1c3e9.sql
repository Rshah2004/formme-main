-- Update the messages insert policy to allow the new columns
DROP POLICY IF EXISTS "Users can send messages for their orders" ON public.messages;

CREATE POLICY "Users can send messages for their orders"
ON public.messages
FOR INSERT
WITH CHECK (
  (auth.uid() = sender_id) AND 
  (EXISTS (
    SELECT 1 FROM orders o
    WHERE (o.id = messages.order_id) AND 
    ((o.designer_id = auth.uid()) OR 
    (EXISTS (SELECT 1 FROM manufacturers m WHERE m.id = o.manufacturer_id AND m.user_id = auth.uid())))
  ))
);

-- Allow users to update their own messages (for read receipts)
DROP POLICY IF EXISTS "Users can update their own messages read status" ON public.messages;

CREATE POLICY "Users can update messages read status"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE (o.id = messages.order_id) AND 
    ((o.designer_id = auth.uid()) OR 
    (EXISTS (SELECT 1 FROM manufacturers m WHERE m.id = o.manufacturer_id AND m.user_id = auth.uid())))
  )
);