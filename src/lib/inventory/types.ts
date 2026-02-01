/**
 * Inventory Types
 * 
 * Type definitions for inventory management system
 */

export interface InventoryReservationResult {
  success: boolean;
  reservation_id?: string;
  error?: string;
  message: string;
  details?: {
    requested: number;
    available: number;
  };
}

export interface InventoryReleaseResult {
  success: boolean;
  message: string;
  quantity_released?: number;
}

export interface InventoryAdjustmentResult {
  success: boolean;
  message: string;
  quantity_before?: number;
  quantity_after?: number;
  adjustment?: number;
}

export interface LowStockCheckResult {
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  available_quantity?: number;
  threshold?: number;
  message?: string;
}

export interface AvailableInventory {
  product_id: string;
  variant_id?: string;
  total_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
}

export interface InventoryAuditEntry {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity_before: number;
  quantity_after: number;
  change_amount: number;
  reason: 'sale' | 'reservation' | 'release' | 'restock' | 'sync' | 'adjustment' | 'cancellation';
  source: 'cart' | 'checkout' | 'factory_sync' | 'return' | 'admin' | 'system';
  user_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface StockNotificationRequest {
  productId: string;
  variantId?: string;
  email: string;
}

export interface ReservationConfig {
  expiresInMinutes: number;
  extensionMinutes: number;
}

export const DEFAULT_RESERVATION_CONFIG: ReservationConfig = {
  expiresInMinutes: 15,
  extensionMinutes: 15,
};

// Extended types for queries with related data
export interface InventoryWithProduct {
  product_id: string;
  variant_id: string | null;
  total_quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  // Legacy fields from database
  quantity: number;
  reserved: number;
  production_status: string | null;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    category: string;
  };
}

export interface CartReservationWithDetails {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  expires_at: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
  product_variants?: {
    id: string;
    size: string;
    color: string;
  };
}

export interface StockNotification {
  id: string;
  product_id: string;
  variant_id?: string;
  email: string;
  status: 'pending' | 'notified' | 'expired';
  created_at: string;
  notified_at?: string;
}
