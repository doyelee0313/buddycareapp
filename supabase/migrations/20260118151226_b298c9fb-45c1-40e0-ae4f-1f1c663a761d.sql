-- Create caregiver_coupons table to track earned rewards
CREATE TABLE public.caregiver_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID NOT NULL,
  coupon_type TEXT NOT NULL DEFAULT 'coffee',
  coupon_title TEXT NOT NULL,
  coupon_description TEXT,
  coupon_code TEXT NOT NULL,
  hearts_required INTEGER NOT NULL DEFAULT 20,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.caregiver_coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for caregiver access
CREATE POLICY "Caregivers can view their own coupons"
  ON public.caregiver_coupons FOR SELECT
  USING (auth.uid() = caregiver_id);

CREATE POLICY "System can insert coupons"
  ON public.caregiver_coupons FOR INSERT
  WITH CHECK (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can update their own coupons"
  ON public.caregiver_coupons FOR UPDATE
  USING (auth.uid() = caregiver_id);