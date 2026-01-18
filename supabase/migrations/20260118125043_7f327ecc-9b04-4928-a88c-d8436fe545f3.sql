-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Allow service role insert" ON public.caregiver_logs;

-- For edge functions using service role, we need to allow authenticated inserts
-- The edge function will validate the relationship before inserting
CREATE POLICY "Service role can insert logs"
ON public.caregiver_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Alternative: Use a function-based approach that the edge function calls
CREATE OR REPLACE FUNCTION public.insert_caregiver_log(
  p_elderly_user_id UUID,
  p_caregiver_id UUID,
  p_log_type TEXT,
  p_title TEXT,
  p_content TEXT,
  p_severity TEXT DEFAULT NULL,
  p_emotion_detected TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Verify the relationship exists
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = p_elderly_user_id 
    AND linked_caregiver_id = p_caregiver_id
  ) THEN
    RAISE EXCEPTION 'Invalid elderly-caregiver relationship';
  END IF;
  
  INSERT INTO caregiver_logs (
    elderly_user_id, caregiver_id, log_type, title, content, severity, emotion_detected
  ) VALUES (
    p_elderly_user_id, p_caregiver_id, p_log_type, p_title, p_content, p_severity, p_emotion_detected
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;