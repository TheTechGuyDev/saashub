-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Super admins can view all subscribers
CREATE POLICY "Super admins can view all subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- Super admins can manage subscribers
CREATE POLICY "Super admins can manage subscribers"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Allow anonymous inserts (for public newsletter signups)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create index for email lookups
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);

-- Create index for subscribed status
CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers(unsubscribed_at) WHERE unsubscribed_at IS NULL;