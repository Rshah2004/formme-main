-- Create storage bucket for tech pack uploads (called "designs" for consistency with current code)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the designs bucket
CREATE POLICY "Users can upload to designs bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'designs' AND auth.uid()::text IS NOT NULL);

CREATE POLICY "Users can update their uploads in designs bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'designs' AND auth.uid()::text IS NOT NULL);

CREATE POLICY "Anyone can view designs bucket objects" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'designs');

CREATE POLICY "Users can delete their uploads in designs bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'designs' AND auth.uid()::text IS NOT NULL);