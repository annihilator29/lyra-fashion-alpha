-- Create newsletter subscriptions table
-- This table stores email addresses for newsletter subscriptions

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);

-- Add comment to table
COMMENT ON TABLE public.newsletter_subscriptions IS 'Stores email addresses subscribed to the newsletter';

-- Add comments to columns
COMMENT ON COLUMN public.newsletter_subscriptions.id IS 'Unique identifier for each subscription';
COMMENT ON COLUMN public.newsletter_subscriptions.email IS 'Email address of the subscriber';
COMMENT ON COLUMN public.newsletter_subscriptions.subscribed_at IS 'Timestamp when the subscription was created';
COMMENT ON COLUMN public.newsletter_subscriptions.status IS 'Subscription status (active, unsubscribed)';
COMMENT ON COLUMN public.newsletter_subscriptions.created_at IS 'Record creation timestamp';

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for newsletter subscriptions
CREATE POLICY "Users can insert newsletter subscriptions"
    ON public.newsletter_subscriptions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Enable RLS on newsletter_subscriptions
ALTER TABLE public.newsletter_subscriptions FORCE ROW LEVEL SECURITY;
