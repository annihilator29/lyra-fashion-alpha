-- Transactional email triggers for order events
-- Story 4.5: Email Notifications & Marketing Preferences
-- Migration: 20260101_004_order_email_triggers.sql

-- Function to send order confirmation email
CREATE OR REPLACE FUNCTION send_order_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  customer_email TEXT;
  customer_name TEXT;
  order_number TEXT;
BEGIN
  -- Get customer email and name
  SELECT c.email, c.name
  INTO customer_email, customer_name
  FROM customers c
  WHERE c.id = NEW.customer_id;

  -- Get order number
  SELECT NEW.order_number INTO order_number;

  -- Insert into email_queue for processing
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
    'order_confirmation',
    customer_email,
    NEW.customer_id,
    'Order Confirmation #' || order_number,
    jsonb_build_object(
      'order_id', NEW.id,
      'order_number', order_number,
      'customer_name', customer_name,
      'total', NEW.total,
      'created_at', NEW.created_at
    ),
    1, -- Highest priority
    'pending',
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send shipment notification email
CREATE OR REPLACE FUNCTION send_shipment_notification_email()
RETURNS TRIGGER AS $$
DECLARE
  customer_email TEXT;
  customer_name TEXT;
  order_number TEXT;
BEGIN
  -- Only trigger when shipped_at is set and order status changes to 'shipped'
  IF OLD.status = NEW.status OR NEW.status != 'shipped' OR NEW.shipped_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get customer email and order info
  SELECT c.email, c.name, o.order_number
  INTO customer_email, customer_name, order_number
  FROM customers c
  INNER JOIN orders o ON o.customer_id = c.id
  WHERE o.id = NEW.id;

  -- Insert into email_queue
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
    'shipment',
    customer_email,
    NEW.customer_id,
    'Your order #' || order_number || ' has shipped!',
    jsonb_build_object(
      'order_id', NEW.id,
      'order_number', order_number,
      'customer_name', customer_name,
      'tracking_number', NEW.tracking_number,
      'carrier', NEW.carrier,
      'shipped_at', NEW.shipped_at,
      'estimated_delivery', NEW.estimated_delivery
    ),
    1, -- Highest priority
    'pending',
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send delivery confirmation email
CREATE OR REPLACE FUNCTION send_delivery_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  customer_email TEXT;
  customer_name TEXT;
  order_number TEXT;
BEGIN
  -- Only trigger when delivered_at is set and order status changes to 'delivered'
  IF OLD.status = NEW.status OR NEW.status != 'delivered' OR NEW.delivered_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get customer email and order info
  SELECT c.email, c.name, o.order_number
  INTO customer_email, customer_name, order_number
  FROM customers c
  INNER JOIN orders o ON o.customer_id = c.id
  WHERE o.id = NEW.id;

  -- Insert into email_queue
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
    'delivery',
    customer_email,
    NEW.customer_id,
    'Your order #' || order_number || ' has been delivered!',
    jsonb_build_object(
      'order_id', NEW.id,
      'order_number', order_number,
      'customer_name', customer_name,
      'delivered_at', NEW.delivered_at,
      'tracking_number', NEW.tracking_number
    ),
    2, -- High priority (slightly lower than shipment)
    'pending',
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
-- Order creation trigger
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_confirmation_email();

-- Shipment status change trigger on orders table
DROP TRIGGER IF EXISTS on_order_status_changed ON orders;
CREATE TRIGGER on_order_status_changed
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_shipment_notification_email();

-- Delivery confirmation trigger (also uses orders table)
DROP TRIGGER IF EXISTS on_delivery_confirmed ON orders;
CREATE TRIGGER on_delivery_confirmed
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_delivery_confirmation_email();

-- Add comments
COMMENT ON FUNCTION send_order_confirmation_email() IS 'Automatically sends order confirmation email when order is created';
COMMENT ON FUNCTION send_shipment_notification_email() IS 'Automatically sends shipment notification when order status changes to shipped';
COMMENT ON FUNCTION send_delivery_confirmation_email() IS 'Automatically sends delivery confirmation when order status changes to delivered';
