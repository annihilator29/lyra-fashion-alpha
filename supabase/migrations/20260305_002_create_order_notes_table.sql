-- Story 7.3: Order Management & Fulfillment Tools
-- Create order_notes table for internal admin notes

CREATE TABLE IF NOT EXISTS public.order_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can view/create/update/delete notes
CREATE POLICY IF NOT EXISTS "Admin full access to order notes" 
ON public.order_notes
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.customers 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON public.order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_created_at ON public.order_notes(created_at DESC);

COMMENT ON TABLE public.order_notes IS 'Internal admin notes for orders - not visible to customers';
COMMENT ON COLUMN public.order_notes.created_by IS 'Admin user who created the note';
