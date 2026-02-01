-- Migration: Add inventory management extensions for Story 6.2
-- Created: 2026-02-01
-- Description: Extends inventory system with reservations, audit logging, and stock notifications

-- ============================================
-- Task 1.1-1.3: Extend inventory table
-- ============================================

-- Add new columns to inventory table
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS total_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE;

-- Migrate existing data: set total_quantity from current quantity
UPDATE inventory 
SET total_quantity = quantity,
    reserved_quantity = COALESCE(reserved, 0)
WHERE total_quantity = 0;

-- Create index for variant lookups
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory(variant_id);

-- ============================================
-- Task 1.4: Create cart_reservations table
-- ============================================

CREATE TABLE IF NOT EXISTS cart_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cart_reservations
CREATE INDEX IF NOT EXISTS idx_cart_reservations_cart ON cart_reservations(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_reservations_product ON cart_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_reservations_expires ON cart_reservations(expires_at);

-- Enable RLS on cart_reservations
ALTER TABLE cart_reservations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Task 1.5: Create inventory_audit_log table
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('sale', 'reservation', 'release', 'restock', 'sync', 'adjustment', 'cancellation')),
    source VARCHAR(50) NOT NULL CHECK (source IN ('cart', 'checkout', 'factory_sync', 'return', 'admin', 'system')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_product ON inventory_audit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_variant ON inventory_audit_log(variant_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON inventory_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_reason ON inventory_audit_log(reason);

-- Enable RLS on audit log
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Task 1.6: Create stock_notifications table
-- ============================================

CREATE TABLE IF NOT EXISTS stock_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'unsubscribed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(product_id, variant_id, email)
);

-- Indexes for stock notifications
CREATE INDEX IF NOT EXISTS idx_stock_notifications_product ON stock_notifications(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_notifications_status ON stock_notifications(status);
CREATE INDEX IF NOT EXISTS idx_stock_notifications_email ON stock_notifications(email);

-- Enable RLS on stock_notifications
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Task 1.7: Additional indexes for performance
-- ============================================

-- Composite index for inventory lookups by product + variant
CREATE INDEX IF NOT EXISTS idx_inventory_product_variant ON inventory(product_id, variant_id);

-- Partial index for low stock items (optimization for alerts)
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(product_id) 
WHERE (total_quantity - reserved_quantity) <= low_stock_threshold;

-- ============================================
-- Task 1.8: Create atomic reservation function
-- ============================================

CREATE OR REPLACE FUNCTION reserve_inventory(
    p_cart_id UUID,
    p_product_id UUID,
    p_variant_id UUID,
    p_quantity INTEGER,
    p_expires_at TIMESTAMP WITH TIME ZONE
) RETURNS JSONB AS $$
DECLARE
    v_available INTEGER;
    v_reservation_id UUID;
    v_quantity_before INTEGER;
BEGIN
    -- Lock the inventory row and check available quantity
    SELECT (total_quantity - reserved_quantity), total_quantity
    INTO v_available, v_quantity_before
    FROM inventory
    WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL))
    FOR UPDATE;
    
    -- Check if inventory record exists
    IF v_available IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INVENTORY_NOT_FOUND',
            'message', 'Inventory record not found for product'
        );
    END IF;
    
    -- Check if sufficient inventory available
    IF v_available < p_quantity THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INSUFFICIENT_INVENTORY',
            'message', 'Insufficient inventory available',
            'details', jsonb_build_object(
                'requested', p_quantity,
                'available', v_available
            )
        );
    END IF;
    
    -- Create reservation
    INSERT INTO cart_reservations (cart_id, product_id, variant_id, quantity, expires_at)
    VALUES (p_cart_id, p_product_id, p_variant_id, p_quantity, p_expires_at)
    RETURNING id INTO v_reservation_id;
    
    -- Update reserved quantity
    UPDATE inventory 
    SET reserved_quantity = reserved_quantity + p_quantity,
        updated_at = NOW()
    WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
    
    -- Log to audit
    INSERT INTO inventory_audit_log (product_id, variant_id, quantity_before, quantity_after, 
        change_amount, reason, source, user_id, metadata)
    VALUES (p_product_id, p_variant_id, v_quantity_before, v_quantity_before - p_quantity, 
        -p_quantity, 'reservation', 'cart', NULL, jsonb_build_object('reservation_id', v_reservation_id, 'cart_id', p_cart_id));
    
    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_reservation_id,
        'message', 'Inventory reserved successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Task 1.8: Create release reservation function
-- ============================================

CREATE OR REPLACE FUNCTION release_reservation(
    p_reservation_id UUID,
    p_reason VARCHAR(50) DEFAULT 'release'
) RETURNS JSONB AS $$
DECLARE
    v_reservation RECORD;
    v_quantity_before INTEGER;
BEGIN
    -- Get reservation details and lock inventory
    SELECT cr.*, (i.total_quantity - i.reserved_quantity) as available
    INTO v_reservation
    FROM cart_reservations cr
    JOIN inventory i ON i.product_id = cr.product_id 
        AND (i.variant_id = cr.variant_id OR (i.variant_id IS NULL AND cr.variant_id IS NULL))
    WHERE cr.id = p_reservation_id
    FOR UPDATE OF i;
    
    IF v_reservation IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'RESERVATION_NOT_FOUND',
            'message', 'Reservation not found'
        );
    END IF;
    
    -- Get current quantity before update
    SELECT (total_quantity - reserved_quantity) + v_reservation.quantity
    INTO v_quantity_before
    FROM inventory
    WHERE product_id = v_reservation.product_id 
    AND (variant_id = v_reservation.variant_id OR (variant_id IS NULL AND v_reservation.variant_id IS NULL));
    
    -- Update inventory reserved quantity
    UPDATE inventory 
    SET reserved_quantity = GREATEST(0, reserved_quantity - v_reservation.quantity),
        updated_at = NOW()
    WHERE product_id = v_reservation.product_id 
    AND (variant_id = v_reservation.variant_id OR (variant_id IS NULL AND v_reservation.variant_id IS NULL));
    
    -- Delete reservation
    DELETE FROM cart_reservations WHERE id = p_reservation_id;
    
    -- Log to audit
    INSERT INTO inventory_audit_log (product_id, variant_id, quantity_before, quantity_after, 
        change_amount, reason, source, user_id, metadata)
    VALUES (v_reservation.product_id, v_reservation.variant_id, v_quantity_before - v_reservation.quantity, v_quantity_before, 
        v_reservation.quantity, p_reason, 'system', NULL, jsonb_build_object('reservation_id', p_reservation_id, 'cart_id', v_reservation.cart_id));
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Reservation released successfully',
        'quantity_released', v_reservation.quantity
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Task 1.8: Create function to adjust inventory
-- ============================================

CREATE OR REPLACE FUNCTION adjust_inventory(
    p_product_id UUID,
    p_variant_id UUID,
    p_adjustment INTEGER,
    p_reason VARCHAR(50),
    p_source VARCHAR(50),
    p_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
    v_quantity_before INTEGER;
    v_new_total INTEGER;
BEGIN
    -- Lock inventory row
    SELECT total_quantity
    INTO v_quantity_before
    FROM inventory
    WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL))
    FOR UPDATE;
    
    IF v_quantity_before IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INVENTORY_NOT_FOUND',
            'message', 'Inventory record not found'
        );
    END IF;
    
    -- Calculate new total (prevent negative)
    v_new_total := GREATEST(0, v_quantity_before + p_adjustment);
    
    -- Update inventory
    UPDATE inventory 
    SET total_quantity = v_new_total,
        updated_at = NOW()
    WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
    
    -- Log to audit
    INSERT INTO inventory_audit_log (product_id, variant_id, quantity_before, quantity_after, 
        change_amount, reason, source, user_id, metadata)
    VALUES (p_product_id, p_variant_id, v_quantity_before, v_new_total, 
        p_adjustment, p_reason, p_source, p_user_id, p_metadata);
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Inventory adjusted successfully',
        'quantity_before', v_quantity_before,
        'quantity_after', v_new_total,
        'adjustment', p_adjustment
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Task 1.8: Create function to check and alert low stock
-- ============================================

CREATE OR REPLACE FUNCTION check_low_stock(
    p_product_id UUID,
    p_variant_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_inventory RECORD;
    v_available INTEGER;
BEGIN
    SELECT *, (total_quantity - reserved_quantity) as available
    INTO v_inventory
    FROM inventory
    WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
    
    IF v_inventory IS NULL THEN
        RETURN jsonb_build_object(
            'is_low_stock', false,
            'is_out_of_stock', false,
            'message', 'Inventory record not found'
        );
    END IF;
    
    v_available := v_inventory.total_quantity - v_inventory.reserved_quantity;
    
    RETURN jsonb_build_object(
        'is_low_stock', v_available <= v_inventory.low_stock_threshold AND v_available > 0,
        'is_out_of_stock', v_available <= 0,
        'available_quantity', v_available,
        'threshold', v_inventory.low_stock_threshold
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS Policies for new tables
-- ============================================

-- Cart reservations: Users can only see their own cart reservations
CREATE POLICY "Users can view own reservations" ON cart_reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE id = cart_reservations.cart_id 
            AND user_id = auth.uid()
        )
    );

-- Inventory audit log: Only admins can view
CREATE POLICY "Only admins can view audit log" ON inventory_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Stock notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON stock_notifications
    FOR SELECT USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Stock notifications: Allow inserts for anonymous users
CREATE POLICY "Allow stock notification signups" ON stock_notifications
    FOR INSERT WITH CHECK (true);

-- Update inventory table RLS policies
DROP POLICY IF EXISTS "Users can view inventory" ON inventory;
CREATE POLICY "Users can view inventory" ON inventory
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage inventory" ON inventory;
CREATE POLICY "Only admins can manage inventory" ON inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- Trigger for automatic updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_reservations_updated_at
    BEFORE UPDATE ON cart_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
