/**
 * Order Types for Story 4.3 - Order History & Tracking
 */

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'production'
  | 'quality_check'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type ProductionStageStatus = 'not_started' | 'in_progress' | 'completed';

export type ProductionStageName = 'cutting' | 'sewing' | 'finishing' | 'qc';

export interface ProductionStage {
  status: ProductionStageStatus;
  started_at?: string;
  completed_at?: string;
}

export interface ProductionStages {
  cutting: ProductionStage;
  sewing: ProductionStage;
  finishing: ProductionStage;
  qc: ProductionStage;
}

// Helper type for indexing ProductionStages
export type ProductionStagesMap = Record<ProductionStageName, ProductionStage>;

export interface OrderWithItems {
  id: string;
  order_number?: string;
  customer_id: string | null;
  customer_email: string | null;
  status: OrderStatus;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
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
  production_completion_estimate: string | null;
  qc_photo_url: string | null;
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  payment_status?: string;
  refunded_amount?: number;
  status_notes?: string;
  email_sent?: boolean;
  email_sent_at?: string | null;
  email_error?: string | null;
  customer_profiles?: {
    full_name?: string;
    email?: string;
  };
  order_items?: Array<{
    id: string;
    order_id: string;
    product_id: string;
    product_name?: string;
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
      category: string;
      images: string[];
      price: number;
      final_sale?: boolean;
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
  paid: {
    label: 'Paid',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: 'credit-card',
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
