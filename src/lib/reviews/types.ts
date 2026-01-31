export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  order_id: string;
  rating: number; // 1-5
  title: string;
  content: string;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  helpful_count: number;
  fit_feedback: 'true-to-size' | 'small' | 'large' | 'n/a';
  created_at: string;
  updated_at?: string;
  rejection_reason?: string | null;
  customer?: {
    name: string | null;
  };
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verified_count: number;
}

export type ReviewSortOption = 'newest' | 'highest' | 'lowest' | 'verified';

export interface ReviewFilters {
  sort: ReviewSortOption;
  verifiedOnly: boolean;
}
