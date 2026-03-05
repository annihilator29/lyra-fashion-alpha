-- Story 7.3: Order Management & Fulfillment Tools
-- Create order_status_history table for audit trail of status changes

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all history
CREATE POLICY IF NOT EXISTS "Admins can view order status history" 
ON public.order_status_history
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.customers 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- System can insert history (via triggers or direct inserts)
CREATE POLICY IF NOT EXISTS "System can insert order status history" 
ON public.order_status_history
FOR INSERT 
WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history(created_at DESC);

COMMENT ON TABLE public.order_status_history IS 'Audit trail of all order status changes';
COMMENT ON COLUMN public.order_status_history.from_status IS 'Previous status before change';
COMMENT ON COLUMN public.order_status_history.to_status IS 'New status after change';
COMMENT ON COLUMN public.order_status_history.changed_by IS 'Admin user who made the change';
COMMENT ON COLUMN public.order_status_history.notes IS 'Notes about the status change';
