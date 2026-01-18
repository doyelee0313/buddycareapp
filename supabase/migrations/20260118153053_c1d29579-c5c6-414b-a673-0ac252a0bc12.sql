-- Create patient_profiles table for storing patient health information
CREATE TABLE public.patient_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  chronic_diseases text[] DEFAULT '{}',
  current_medications text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  health_status_summary text,
  emergency_contact text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Elderly can view their own patient profile
CREATE POLICY "Users can view own patient profile"
  ON public.patient_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Elderly can insert their own patient profile
CREATE POLICY "Users can insert own patient profile"
  ON public.patient_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Elderly can update their own patient profile
CREATE POLICY "Users can update own patient profile"
  ON public.patient_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can view linked patient profiles
CREATE POLICY "Caregivers can view linked patient profiles"
  ON public.patient_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = patient_profiles.user_id
      AND p.linked_caregiver_id = auth.uid()
    )
  );

-- Caregivers can update linked patient profiles
CREATE POLICY "Caregivers can update linked patient profiles"
  ON public.patient_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = patient_profiles.user_id
      AND p.linked_caregiver_id = auth.uid()
    )
  );

-- Caregivers can insert patient profiles for linked elderly
CREATE POLICY "Caregivers can insert linked patient profiles"
  ON public.patient_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = user_id
      AND p.linked_caregiver_id = auth.uid()
    )
  );

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_patient_profiles_updated_at
BEFORE UPDATE ON public.patient_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();