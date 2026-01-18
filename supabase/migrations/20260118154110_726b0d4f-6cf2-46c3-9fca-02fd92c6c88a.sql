-- Create daily_summaries table for caching AI-generated summaries
CREATE TABLE public.daily_summaries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  summary_date date NOT NULL,
  summary text NOT NULL,
  has_concern boolean DEFAULT false,
  concern_reason text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, summary_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- Caregivers can view summaries of linked elderly
CREATE POLICY "Caregivers can view linked summaries"
  ON public.daily_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = daily_summaries.user_id
      AND p.linked_caregiver_id = auth.uid()
    )
  );

-- Allow insert via service role (edge function)
CREATE POLICY "Service role can insert summaries"
  ON public.daily_summaries FOR INSERT
  WITH CHECK (true);

-- Allow update for regenerating summaries
CREATE POLICY "Service role can update summaries"
  ON public.daily_summaries FOR UPDATE
  USING (true);