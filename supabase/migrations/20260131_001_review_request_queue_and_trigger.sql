-- Post-Purchase Email Workflow Migration
-- Story 5.4 Task 4: 7-day review request email after order delivery (AC #5)
-- Migration: 20260131_001_review_request_queue_and_trigger.sql

-- Create review_request_queue table for 7-day review emails
CREATE TABLE IF NOT EXISTS review_request_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  review_token TEXT NOT NULL,
  review_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure unique combination of order and product
  CONSTRAINT unique_order_product_review UNIQUE (order_id, product_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_review_request_queue_status ON review_request_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_request_queue_scheduled_for ON review_request_queue(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_review_request_queue_order_id ON review_request_queue(order_id);
CREATE INDEX IF NOT EXISTS idx_review_request_queue_customer_id ON review_request_queue(customer_id);

-- Enable Row Level Security
ALTER TABLE review_request_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_request_queue
-- Service role can manage all review requests
CREATE POLICY "Service can manage review request queue"
ON review_request_queue
FOR ALL
USING (auth.role() = 'service_role');

-- Customers can view their own review requests
CREATE POLICY "Customers can view their own review requests"
ON review_request_queue
FOR SELECT
USING (customer_id = auth.uid());

-- Add comments for documentation
COMMENT ON TABLE review_request_queue IS 'Queue for 7-day post-delivery review request emails';
COMMENT ON COLUMN review_request_queue.status IS 'pending, sent, failed, cancelled';
COMMENT ON COLUMN review_request_queue.scheduled_for IS 'When the review email should be sent (7 days after delivery)';
COMMENT ON COLUMN review_request_queue.review_token IS 'JWT token for secure review submission';
COMMENT ON COLUMN review_request_queue.review_url IS 'Full URL with token for customer to submit review';

-- Add constraint for status
ALTER TABLE review_request_queue
DROP CONSTRAINT IF EXISTS chk_review_request_queue_status;
ALTER TABLE review_request_queue
ADD CONSTRAINT chk_review_request_queue_status
CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_review_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_request_queue_updated_at 
BEFORE UPDATE ON review_request_queue
FOR EACH ROW EXECUTE FUNCTION update_review_queue_updated_at();

-- Function to queue review requests when order is delivered
-- This function creates queue entries that will be processed by the application worker
CREATE OR REPLACE FUNCTION queue_review_requests_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
  customer_email TEXT;
  customer_id UUID;
  customer_name TEXT;
  order_number TEXT;
  review_emails_opted_in BOOLEAN;
  unsubscribe_all BOOLEAN;
BEGIN
  -- Only trigger when status changes to 'delivered' AND delivered_at is set
  IF OLD.status = NEW.status OR NEW.status != 'delivered' OR NEW.delivered_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get customer info
  SELECT c.email, c.id, c.name
  INTO customer_email, customer_id, customer_name
  FROM customers c
  WHERE c.id = NEW.customer_id;

  -- Get order number
  order_number := NEW.order_number;

  -- Check if customer has opted out of review emails
  SELECT 
    COALESCE(ep.review_emails, true),
    COALESCE(ep.unsubscribe_all, false)
  INTO review_emails_opted_in, unsubscribe_all
  FROM email_preferences ep
  WHERE ep.customer_id = customer_id;

  -- Skip if customer opted out
  IF unsubscribe_all OR NOT review_emails_opted_in THEN
    RETURN NEW;
  END IF;

  -- Insert marker record in email_queue to trigger application worker
  -- The worker will call queueReviewRequest server action with the order_id
  INSERT INTO email_queue (
    email_type,
    recipient_email,
    user_id,
    subject,
    template_data,
    priority,
    status,
    scheduled_for
  ) VALUES (
    'review_request_trigger',
    customer_email,
    customer_id,
    'Review Request Trigger - Order #' || order_number,
    jsonb_build_object(
      'order_id', NEW.id,
      'order_number', order_number,
      'customer_id', customer_id,
      'customer_name', customer_name,
      'customer_email', customer_email,
      'trigger_type', 'post_delivery_review'
    ),
    5, -- Medium priority (after order confirmations and shipment notifications)
    'pending',
    NOW() + INTERVAL '7 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on orders table for delivery status change
DROP TRIGGER IF EXISTS on_order_delivered_review_request ON orders;
CREATE TRIGGER on_order_delivered_review_request
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION queue_review_requests_on_delivery();

-- Add comments for the trigger function
COMMENT ON FUNCTION queue_review_requests_on_delivery() IS 'Triggers 7-day review request workflow when order is marked as delivered, respecting customer email preferences';
