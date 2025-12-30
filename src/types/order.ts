/**
 * Order Types for Story 4.3 - Order History & Tracking
 */

export type OrderStatus =
  | 'pending'
  | 'production'
  | 'quality_check'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface ProductionStages {
  cutting?: { status: string; completed_at?: string };
  sewing?: { status: string; completed_at?: string };
  finishing?: { status: string; completed_at?: string };
  qc?: { status: string; completed_at?: string };
}

export interface OrderWithItems {
  id: string;
  customer_id: string | null;
  customer_email: string | null;
  status: OrderStatus;
  total: number;
  shipping_address: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  billing_address: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  } | null;
  ordered_at: string;
  production_started_at: string | null;
  quality_checked_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  production_stages: ProductionStages | null;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
  order_items?: Array<{
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    variant: {
      size?: string;
      color?: string;
      sku?: string;
    } | null;
    products?: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      price: number;
    };
  }>;
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: 'clock',
  },
  production: {
    label: 'In Production',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'package',
  },
  quality_check: {
    label: 'Quality Check',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: 'check-circle',
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: 'truck',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: 'check-circle-2',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: 'x-circle',
  },
};
