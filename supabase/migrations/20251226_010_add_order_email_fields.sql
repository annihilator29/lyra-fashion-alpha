-- Add email tracking columns to orders table
-- Story 3-4: Order Confirmation & Email Notification

-- Add customer_email and email tracking columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_email varchar(255),
ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS email_error text;

-- Create email_logs table for tracking and debugging
CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    email_type varchar(50) NOT NULL, -- 'order_confirmation', 'shipping_notification'
    resend_id varchar(100),
    recipient_email varchar(255) NOT NULL,
    status varchar(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'bounced', 'failed'
    sent_at timestamptz DEFAULT now(),
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for email_logs table
CREATE INDEX IF NOT EXISTS idx_email_logs_order ON public.email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.email_sent IS 'Indicates if order confirmation email has been sent';
COMMENT ON COLUMN public.orders.email_sent_at IS 'Timestamp when order confirmation email was sent';
COMMENT ON COLUMN public.orders.email_error IS 'Error message if email sending failed';
COMMENT ON TABLE public.email_logs IS 'Audit log for all emails sent to customers';
