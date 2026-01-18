-- Create caregiver_logs table for conversation summaries and danger signals
CREATE TABLE public.caregiver_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  elderly_user_id UUID NOT NULL,
  caregiver_id UUID NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('summary', 'danger_signal', 'daily_report')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  emotion_detected TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.caregiver_logs ENABLE ROW LEVEL SECURITY;

-- Caregivers can view logs for their linked elderly users
CREATE POLICY "Caregivers can view their logs"
ON public.caregiver_logs FOR SELECT
USING (caregiver_id = auth.uid());

-- Allow insert from edge functions (service role)
CREATE POLICY "Allow service role insert"
ON public.caregiver_logs FOR INSERT
WITH CHECK (true);

-- Enable realtime for caregiver_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.caregiver_logs;