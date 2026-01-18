-- Fix function search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop the old overly permissive policies that were flagged
DROP POLICY IF EXISTS "Allow all insert access to conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow all read access to conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow all insert access to hearts" ON public.hearts;
DROP POLICY IF EXISTS "Allow all read access to hearts" ON public.hearts;
DROP POLICY IF EXISTS "Allow all insert access to mission_completions" ON public.mission_completions;
DROP POLICY IF EXISTS "Allow all read access to mission_completions" ON public.mission_completions;