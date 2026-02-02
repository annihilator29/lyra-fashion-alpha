/**
 * Return Types for Story 6.4 - Returns & Refunds Processing
 */

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'shipped'
  | 'received'
  | 'inspected'
  | 'refunded'
  | 'rejected';

export type ReturnReason =
  | 'size_fit'
  | 'quality_issue'
  | 'changed_mind'
  | 'damaged'
  | 'other';

export interface Return {
  id: string;
  order_id: string;
  order_item_ids: string[];
  
  // Return details
  reason: ReturnReason;
  condition_notes: string | null;
  
  // Status tracking
  status: ReturnStatus;
  
  // Authorization
  rma_number: string;
  
  // Shipping
  shipping_label_url: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  
  // Financial
  refund_amount: number;
  stripe_refund_id: string | null;
  
  // Inspection
  inspection_notes: string | null;
  inspection_photos: string[] | null;
  inspected_at: string | null;
  inspected_by: string | null;
  
  // Rejection
  rejection_reason: string | null;
  
  // Status timestamps
  requested_at: string;
  approved_at: string | null;
  shipped_at: string | null;
  received_at: string | null;
  refunded_at: string | null;
  rejected_at: string | null;
  
  // Meta
  created_at: string;
  updated_at: string;
}

export interface ReturnWithOrder extends Return {
  order: {
    id: string;
    order_number: string | null;
    customer_id: string | null;
    customer_email: string | null;
    status: string;
    total: number;
    delivered_at: string | null;
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
  };
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
      category: string;
      images: string[];
      price: number;
      final_sale?: boolean;
    };
  }>;
  inspector?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

export interface CreateReturnData {
  orderId: string;
  itemIds: string[];
  reason: ReturnReason;
  conditionNotes?: string;
}

export interface ReturnStatusUpdate {
  status: ReturnStatus;
  inspectionNotes?: string;
  inspectionPhotos?: string[];
  rejectionReason?: string;
}

export interface ReturnStatusStage {
  status: ReturnStatus;
  label: string;
  description: string;
  timestamp: string | null;
  isCurrent: boolean;
  isCompleted: boolean;
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: string;
  description: string;
}

export const RETURN_STATUS_CONFIG: Record<ReturnStatus, StatusConfig> = {
  requested: {
    label: 'Return Requested',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: 'clipboard-list',
    description: 'Your return request has been submitted and is awaiting approval',
  },
  approved: {
    label: 'Return Approved',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'check-circle',
    description: 'Your return has been approved - shipping label sent to your email',
  },
  shipped: {
    label: 'Return Shipped',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: 'truck',
    description: 'Item is in transit back to our facility',
  },
  received: {
    label: 'Return Received',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: 'package-check',
    description: 'Item has arrived at our facility and is awaiting inspection',
  },
  inspected: {
    label: 'Inspection Complete',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: 'search',
    description: 'Item has been inspected and approved for refund',
  },
  refunded: {
    label: 'Refund Processed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: 'banknote',
    description: 'Refund has been processed to your original payment method',
  },
  rejected: {
    label: 'Return Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: 'x-circle',
    description: 'Return was rejected - check email for details and next steps',
  },
};

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  size_fit: 'Size/Fit Issue',
  quality_issue: 'Quality Issue',
  changed_mind: 'Changed My Mind',
  damaged: 'Damaged/Defective',
  other: 'Other',
};

export const RETURN_STATUS_FLOW: ReturnStatus[] = [
  'requested',
  'approved',
  'shipped',
  'received',
  'inspected',
  'refunded',
];
