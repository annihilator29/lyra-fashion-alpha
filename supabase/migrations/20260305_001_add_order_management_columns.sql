-- Story 7.3: Order Management & Fulfillment Tools
-- Add missing columns to orders table for refund tracking and financial breakdown

-- Add refunded_amount column to track total refunded amount
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS refunded_amount numeric DEFAULT 0;

-- Add financial breakdown columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS subtotal numeric;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tax numeric DEFAULT 0;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping numeric DEFAULT 0;

-- Add payment status column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add status notes for admin notes on status changes
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status_notes text;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

COMMENT ON COLUMN public.orders.refunded_amount IS 'Total amount refunded for this order';
COMMENT ON COLUMN public.orders.subtotal IS 'Order subtotal before tax and shipping';
COMMENT ON COLUMN public.orders.tax IS 'Tax amount for the order';
COMMENT ON COLUMN public.orders.shipping IS 'Shipping cost for the order';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN public.orders.status_notes IS 'Admin notes for status changes, visible to customers';
