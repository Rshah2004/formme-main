-- Create signup requests table for invite-only system
CREATE TABLE public.signup_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('designer', 'manufacturer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a signup request (public endpoint)
CREATE POLICY "Anyone can request signup" 
ON public.signup_requests 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view/update signup requests (we'll handle this via edge function)
CREATE POLICY "Users can view their own request" 
ON public.signup_requests 
FOR SELECT 
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create index for faster lookups
CREATE INDEX idx_signup_requests_email ON public.signup_requests(email);
CREATE INDEX idx_signup_requests_status ON public.signup_requests(status);