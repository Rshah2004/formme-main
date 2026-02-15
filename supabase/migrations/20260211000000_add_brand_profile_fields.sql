-- Add brand-specific fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS brand_description TEXT,
ADD COLUMN IF NOT EXISTS brand_url TEXT,
ADD COLUMN IF NOT EXISTS primary_category TEXT,
ADD COLUMN IF NOT EXISTS annual_volume_range TEXT,
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS portfolio_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shipping_street TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_postal TEXT,
ADD COLUMN IF NOT EXISTS shipping_country TEXT;

-- Update handle_new_user to store brand fields from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (
    user_id,
    full_name,
    company_name,
    brand_description,
    brand_url,
    primary_category,
    categories,
    annual_volume_range,
    budget_range,
    portfolio_urls,
    shipping_street,
    shipping_city,
    shipping_state,
    shipping_postal,
    shipping_country
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'brand_description',
    NEW.raw_user_meta_data->>'brand_url',
    NEW.raw_user_meta_data->>'primary_category',
    COALESCE(NEW.raw_user_meta_data->'categories', '[]'::jsonb),
    NEW.raw_user_meta_data->>'annual_volume_range',
    NEW.raw_user_meta_data->>'budget_range',
    COALESCE(NEW.raw_user_meta_data->'portfolio_urls', '[]'::jsonb),
    NEW.raw_user_meta_data->>'shipping_street',
    NEW.raw_user_meta_data->>'shipping_city',
    NEW.raw_user_meta_data->>'shipping_state',
    NEW.raw_user_meta_data->>'shipping_postal',
    NEW.raw_user_meta_data->>'shipping_country'
  );
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  -- Assign role from user metadata (default to 'designer' if not specified)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'designer');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role);
  
  RETURN NEW;
END;
$function$;
