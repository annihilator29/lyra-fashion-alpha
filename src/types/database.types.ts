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
                    preferences: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string; // Must match auth.users.id
                    email: string;
                    name?: string | null;
                    preferences?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    preferences?: Json | null;
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
            orders: {
                Row: {
                    id: string;
                    customer_id: string | null;
                    status: string;
                    total: number;
                    shipping_address: Json;
                    billing_address: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    customer_id?: string | null;
                    status?: string;
                    total: number;
                    shipping_address: Json;
                    billing_address?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    customer_id?: string | null;
                    status?: string;
                    total?: number;
                    shipping_address?: Json;
                    billing_address?: Json | null;
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
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type Inventory = Tables<'inventory'>;

// Insert types
export type ProductInsert = InsertTables<'products'>;
export type CustomerInsert = InsertTables<'customers'>;
export type OrderInsert = InsertTables<'orders'>;
export type OrderItemInsert = InsertTables<'order_items'>;
export type InventoryInsert = InsertTables<'inventory'>;

// Update types
export type ProductUpdate = UpdateTables<'products'>;
export type CustomerUpdate = UpdateTables<'customers'>;
export type OrderUpdate = UpdateTables<'orders'>;
export type OrderItemUpdate = UpdateTables<'order_items'>;
export type InventoryUpdate = UpdateTables<'inventory'>;
