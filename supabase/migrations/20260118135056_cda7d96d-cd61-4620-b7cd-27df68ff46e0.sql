-- Add last_activity_at column to profiles for tracking inactivity
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity_at ON public.profiles(last_activity_at);

-- Allow users to update their own last_activity_at
-- (existing UPDATE policy already covers this since it uses auth.uid() = user_id)