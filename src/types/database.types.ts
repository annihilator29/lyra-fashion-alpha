/**
 * Database Types for Lyra Fashion
 *
 * This file contains TypeScript type definitions for the Supabase database.
 *
 * NOTE: These types are manually defined based on the database schema.
 * For automatic type generation after schema deployment, run:
 *
 *   npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.types.ts
 *
 * Or with linked project:
 *   npx supabase gen types typescript --linked > src/types/database.types.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    price: number;
                    images: string[];
                    category: string;
                    craftsmanship_content: Json | null;
                    transparency_data: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    price: number;
                    images?: string[];
                    category: string;
                    craftsmanship_content?: Json | null;
                    transparency_data?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    price?: number;
                    images?: string[];
                    category?: string;
                    craftsmanship_content?: Json | null;
                    transparency_data?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            product_variants: {
                Row: {
                    id: string;
                    product_id: string;
                    sku: string;
                    size: string;
                    color: string;
                    color_hex: string | null;
                    price_modifier: number;
                    image_url: string | null;
                    stock_quantity: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    sku: string;
                    size: string;
                    color: string;
                    color_hex?: string | null;
                    price_modifier?: number;
                    image_url?: string | null;
                    stock_quantity?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    sku?: string;
                    size?: string;
                    color?: string;
                    color_hex?: string | null;
                    price_modifier?: number;
                    image_url?: string | null;
                    stock_quantity?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'product_variants_product_id_fkey';
                        columns: ['product_id'];
                        isOneToOne: false;
                        referencedRelation: 'products';
                        referencedColumns: ['id'];
                    },
                ];
            };
            customers: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    phone_number: string | null;
                    avatar_url: string | null;
                    preferences: Json | null;
                    email_preferences: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string; // Must match auth.users.id
                    email: string;
                    name?: string | null;
                    phone_number?: string | null;
                    avatar_url?: string | null;
                    preferences?: Json | null;
                    email_preferences?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    phone_number?: string | null;
                    avatar_url?: string | null;
                    preferences?: Json | null;
                    email_preferences?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'customers_id_fkey';
                        columns: ['id'];
                        isOneToOne: true;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };
            shipping_addresses: {
                Row: {
                    id: string;
                    customer_id: string;
                    name: string;
                    address_line1: string;
                    address_line2: string | null;
                    city: string;
                    state: string | null;
                    postal_code: string;
                    country: string;
                    phone: string | null;
                    is_default: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    customer_id: string;
                    name: string;
                    address_line1: string;
                    address_line2?: string | null;
                    city: string;
                    state?: string | null;
                    postal_code: string;
                    country?: string;
                    phone?: string | null;
                    is_default?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    customer_id?: string;
                    name?: string;
                    address_line1?: string;
                    address_line2?: string | null;
                    city?: string;
                    state?: string | null;
                    postal_code?: string;
                    country?: string;
                    phone?: string | null;
                    is_default?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'shipping_addresses_customer_id_fkey';
                        columns: ['customer_id'];
                        isOneToOne: false;
                        referencedRelation: 'customers';
                        referencedColumns: ['id'];
                    },
                ];
            };
            orders: {
                Row: {
                    id: string;
                    customer_id: string | null;
                    customer_email: string | null;
                    status: string;
                    total: number;
                    shipping_address: Json;
                    billing_address: Json | null;
                    email_sent: boolean;
                    email_sent_at: string | null;
                    email_error: string | null;
                    ordered_at: string;
                    production_started_at: string | null;
                    quality_checked_at: string | null;
                    shipped_at: string | null;
                    delivered_at: string | null;
                    production_stages: Json | null;
                    tracking_number: string | null;
                    carrier: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    customer_id?: string | null;
                    customer_email?: string | null;
                    status?: string;
                    total: number;
                    shipping_address: Json;
                    billing_address?: Json | null;
                    email_sent?: boolean;
                    email_sent_at?: string | null;
                    email_error?: string | null;
                    ordered_at?: string;
                    production_started_at?: string | null;
                    quality_checked_at?: string | null;
                    shipped_at?: string | null;
                    delivered_at?: string | null;
                    production_stages?: Json | null;
                    tracking_number?: string | null;
                    carrier?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    customer_id?: string | null;
                    customer_email?: string | null;
                    status?: string;
                    total?: number;
                    shipping_address?: Json;
                    billing_address?: Json | null;
                    email_sent?: boolean;
                    email_sent_at?: string | null;
                    email_error?: string | null;
                    ordered_at?: string;
                    production_started_at?: string | null;
                    quality_checked_at?: string | null;
                    shipped_at?: string | null;
                    delivered_at?: string | null;
                    production_stages?: Json | null;
                    tracking_number?: string | null;
                    carrier?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'orders_customer_id_fkey';
                        columns: ['customer_id'];
                        isOneToOne: false;
                        referencedRelation: 'customers';
                        referencedColumns: ['id'];
                    },
                ];
            };
            email_logs: {
                Row: {
                    id: string;
                    order_id: string;
                    email_type: string;
                    resend_id: string | null;
                    recipient_email: string;
                    status: string;
                    sent_at: string;
                    error_message: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    email_type: string;
                    resend_id?: string | null;
                    recipient_email: string;
                    status?: string;
                    sent_at?: string;
                    error_message?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    email_type?: string;
                    resend_id?: string | null;
                    recipient_email?: string;
                    status?: string;
                    sent_at?: string;
                    error_message?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'email_logs_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                ];
            };
            newsletter_subscriptions: {
                Row: {
                    id: string;
                    email: string;
                    subscribed_at: string;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    email: string;
                };
                Update: {
                    email?: string;
                };
                Relationships: [];
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    product_id: string;
                    quantity: number;
                    price: number;
                    variant: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    product_id: string;
                    quantity?: number;
                    price: number;
                    variant?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    product_id?: string;
                    quantity?: number;
                    price?: number;
                    variant?: Json | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_items_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_items_product_id_fkey';
                        columns: ['product_id'];
                        isOneToOne: false;
                        referencedRelation: 'products';
                        referencedColumns: ['id'];
                    },
                ];
            };
            inventory: {
                Row: {
                    product_id: string;
                    quantity: number;
                    reserved: number;
                    production_status: string | null;
                    updated_at: string;
                };
                Insert: {
                    product_id: string;
                    quantity?: number;
                    reserved?: number;
                    production_status?: string | null;
                    updated_at?: string;
                };
                Update: {
                    product_id?: string;
                    quantity?: number;
                    reserved?: number;
                    production_status?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'inventory_product_id_fkey';
                        columns: ['product_id'];
                        isOneToOne: true;
                        referencedRelation: 'products';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}

// Utility types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];

// Type aliases for common use
export type Product = Tables<'products'>;
export type ProductVariant = Tables<'product_variants'>;
export type Customer = Tables<'customers'>;
export type ShippingAddress = Tables<'shipping_addresses'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type Inventory = Tables<'inventory'>;
export type EmailLog = Tables<'email_logs'>;

// Insert types
export type ProductInsert = InsertTables<'products'>;
export type CustomerInsert = InsertTables<'customers'>;
export type OrderInsert = InsertTables<'orders'>;
export type OrderItemInsert = InsertTables<'order_items'>;
export type InventoryInsert = InsertTables<'inventory'>;
export type EmailLogInsert = InsertTables<'email_logs'>;
export type NewsletterSubscription = Tables<'newsletter_subscriptions'>;
export type NewsletterSubscriptionInsert = InsertTables<'newsletter_subscriptions'>;
export type NewsletterSubscriptionUpdate = UpdateTables<'newsletter_subscriptions'>;

// Update types
export type ProductUpdate = UpdateTables<'products'>;
export type CustomerUpdate = UpdateTables<'customers'>;
export type OrderUpdate = UpdateTables<'orders'>;
export type OrderItemUpdate = UpdateTables<'order_items'>;
export type InventoryUpdate = UpdateTables<'inventory'>;
export type EmailLogUpdate = UpdateTables<'email_logs'>;

// Helper types for common queries
export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products: Product;
  })[];
};
