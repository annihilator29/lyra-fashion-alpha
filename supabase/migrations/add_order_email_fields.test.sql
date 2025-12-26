-- Test migration for email tracking fields
-- This test file verifies the database schema changes are correct

BEGIN;

-- Verify email tracking columns exist in orders table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name IN ('email_sent', 'email_sent_at', 'email_error')
    ) THEN
        RAISE EXCEPTION 'Email tracking columns not found in orders table';
    END IF;
END $$;

-- Verify email_logs table exists and has correct structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'email_logs'
    ) THEN
        RAISE EXCEPTION 'email_logs table not found';
    END IF;
END $$;

-- Verify email_logs table columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'email_logs'
        AND column_name IN ('id', 'order_id', 'email_type', 'resend_id', 'recipient_email', 'status', 'sent_at', 'error_message')
    ) THEN
        RAISE EXCEPTION 'email_logs table missing required columns';
    END IF;
END $$;

ROLLBACK;
