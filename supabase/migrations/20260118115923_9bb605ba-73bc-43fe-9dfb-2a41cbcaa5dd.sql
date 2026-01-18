-- Create user type enum
CREATE TYPE public.user_type AS ENUM ('elderly', 'caregiver');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  user_type public.user_type NOT NULL,
  pin_code TEXT, -- For elderly users (stored as hash in production)
  caregiver_id TEXT, -- For caregiver login ID
  linked_caregiver_id UUID, -- Links elderly to their caregiver
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Caregivers can view their linked elderly profiles
CREATE POLICY "Caregivers can view linked elderly"
  ON public.profiles FOR SELECT
  USING (
    linked_caregiver_id = auth.uid()
  );

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user type
CREATE OR REPLACE FUNCTION public.get_user_type(_user_id UUID)
RETURNS public.user_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type FROM public.profiles WHERE user_id = _user_id
$$;

-- Update conversations table RLS
DROP POLICY IF EXISTS "Allow public read" ON public.conversations;
DROP POLICY IF EXISTS "Allow public insert" ON public.conversations;

-- Proper conversations policies
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Caregivers can view their elderly's conversations
CREATE POLICY "Caregivers can view linked conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = conversations.user_id
        AND p.linked_caregiver_id = auth.uid()
    )
  );

-- Update hearts table RLS
DROP POLICY IF EXISTS "Allow public read" ON public.hearts;
DROP POLICY IF EXISTS "Allow public insert" ON public.hearts;

CREATE POLICY "Users can send hearts"
  ON public.hearts FOR INSERT
  WITH CHECK (auth.uid()::text = from_user_id);

CREATE POLICY "Users can view hearts they sent or received"
  ON public.hearts FOR SELECT
  USING (
    auth.uid()::text = from_user_id OR auth.uid()::text = to_user_id
  );

-- Update mission_completions table RLS
DROP POLICY IF EXISTS "Allow public read" ON public.mission_completions;
DROP POLICY IF EXISTS "Allow public insert" ON public.mission_completions;

CREATE POLICY "Users can complete missions"
  ON public.mission_completions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view own missions"
  ON public.mission_completions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Caregivers can view linked missions"
  ON public.mission_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = mission_completions.user_id
        AND p.linked_caregiver_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();