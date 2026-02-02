-- Fix storage RLS policies for chat attachments
-- Allow authenticated users to upload files to design-files bucket

-- First, let's create a policy for uploading to the chat-attachments folder within design-files bucket
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'design-files' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'chat-attachments'
);

-- Allow users to view/download chat attachments for their orders
CREATE POLICY "Users can view chat attachments for their orders"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'design-files'
  AND (storage.foldername(name))[1] = 'chat-attachments'
  AND auth.uid() IS NOT NULL
);

-- Allow users to update their own chat attachments
CREATE POLICY "Users can update their own chat attachments"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'design-files'
  AND (storage.foldername(name))[1] = 'chat-attachments'
  AND auth.uid() IS NOT NULL
);

-- Allow users to delete their own chat attachments
CREATE POLICY "Users can delete their own chat attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'design-files'
  AND (storage.foldername(name))[1] = 'chat-attachments'
  AND auth.uid() IS NOT NULL
);