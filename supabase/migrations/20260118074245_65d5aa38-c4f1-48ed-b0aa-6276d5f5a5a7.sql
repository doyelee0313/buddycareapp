-- Create conversations table to store AI chat logs
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default_elderly_user',
  role TEXT NOT NULL CHECK (role IN ('puppy', 'user')),
  content TEXT NOT NULL,
  emotion_tag TEXT CHECK (emotion_tag IN ('happy', 'sad', 'neutral', 'pain_suspected', 'anxious')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hearts table to track heart notifications
CREATE TABLE public.hearts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id TEXT NOT NULL DEFAULT 'default_elderly_user',
  to_user_id TEXT NOT NULL DEFAULT 'default_caregiver',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mission_completions table to track mission status
CREATE TABLE public.mission_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default_elderly_user',
  mission_type TEXT NOT NULL CHECK (mission_type IN ('medicine', 'meal', 'exercise', 'mood')),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (for now allowing all access since no auth yet)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode - no auth required)
CREATE POLICY "Allow all read access to conversations" 
ON public.conversations FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to conversations" 
ON public.conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all read access to hearts" 
ON public.hearts FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to hearts" 
ON public.hearts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all read access to mission_completions" 
ON public.mission_completions FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to mission_completions" 
ON public.mission_completions FOR INSERT WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hearts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_completions;