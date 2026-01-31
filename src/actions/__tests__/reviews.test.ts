import {
  submitProductReview,
  approveReview,
  rejectReview,
} from '@/actions/reviews';
import type { ReviewSubmissionData } from '@/lib/reviews/validation';
import { createClient } from '@/lib/supabase/server';
import { verifyReviewToken } from '@/lib/reviews/tokens';
import { requireAdmin } from '@/lib/auth/roles';
import { updateProductAggregates } from '@/lib/reviews/queries';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/reviews/tokens');
jest.mock('@/lib/auth/roles');
jest.mock('@/lib/reviews/queries');
jest.mock('next/cache');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifyReviewToken = verifyReviewToken as jest.MockedFunction<typeof verifyReviewToken>;
const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
const mockUpdateProductAggregates = updateProductAggregates as jest.MockedFunction<typeof updateProductAggregates>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

describe('submitProductReview', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  const validSubmission: ReviewSubmissionData = {
    rating: 4,
    title: 'Great product quality',
    content: 'This product exceeded my expectations. The quality is outstanding and it fits perfectly. I would highly recommend this to anyone looking for something similar.',
    fitFeedback: 'true-to-size',
    token: 'valid-token-12345',
  };

  const mockTokenPayload = {
    orderId: 'order-123',
    productId: 'product-456',
    customerId: 'customer-789',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);
    mockVerifyReviewToken.mockResolvedValue(mockTokenPayload);
    mockRevalidatePath.mockImplementation(() => {});
  });

  it('should successfully submit a review', async () => {
    // Mock order query
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'order-123',
              status: 'delivered',
              customer_id: 'customer-789',
              delivered_at: new Date().toISOString(),
            },
            error: null,
          }),
        };
      }
      if (table === 'product_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          insert: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'review-123' }, error: null }),
        };
      }
      if (table === 'products') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { slug: 'test-product', category: 'dresses' },
            error: null,
          }),
        };
      }
      return {};
    });

    const result = await submitProductReview(validSubmission);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Review submitted successfully');
    expect(result.reviewId).toBe('review-123');
  });

  it('should reject invalid token', async () => {
    mockVerifyReviewToken.mockResolvedValue(null);

    const result = await submitProductReview(validSubmission);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid or expired review token');
    expect(result.error).toContain('review link is no longer valid');
  });

  it('should prevent duplicate review submission', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'order-123',
              status: 'delivered',
              customer_id: 'customer-789',
              delivered_at: new Date().toISOString(),
            },
            error: null,
          }),
        };
      }
      if (table === 'product_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'existing-review' },
            error: null,
          }),
        };
      }
      return {};
    });

    const result = await submitProductReview(validSubmission);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Review already submitted');
    expect(result.error).toContain('already submitted a review');
  });

  it('should validate input data', async () => {
    const invalidSubmission = {
      ...validSubmission,
      rating: 6, // Invalid: above 5
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await submitProductReview(invalidSubmission as any);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed');
    expect(result.error).toBeDefined();
  });
});

describe('approveReview', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);
    mockRequireAdmin.mockResolvedValue(undefined);
    mockUpdateProductAggregates.mockResolvedValue(undefined);
    mockRevalidatePath.mockImplementation(() => {});
  });

  it('should approve a review and update product aggregates', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'product_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'review-123',
              product_id: 'product-456',
              status: 'pending',
            },
            error: null,
          }),
          update: jest.fn().mockReturnThis(),
        };
      }
      return {};
    });

    const result = await approveReview('review-123');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Review approved successfully');
    expect(mockUpdateProductAggregates).toHaveBeenCalledWith('product-456');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/reviews');
  });

  it('should return error when review not found', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'product_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        };
      }
      return {};
    });

    const result = await approveReview('non-existent-review');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Review not found');
  });
});

describe('rejectReview', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);
    mockRequireAdmin.mockResolvedValue(undefined);
    mockRevalidatePath.mockImplementation(() => {});
  });

  it('should reject a review with reason', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'product_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'review-123',
              product_id: 'product-456',
              status: 'pending',
            },
            error: null,
          }),
          update: jest.fn().mockReturnThis(),
        };
      }
      return {};
    });

    const result = await rejectReview('review-123', 'Contains inappropriate language');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Review rejected successfully');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/reviews');
  });

  it('should reject a review without reason', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'product_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'review-123',
              product_id: 'product-456',
              status: 'pending',
            },
            error: null,
          }),
          update: jest.fn().mockReturnThis(),
        };
      }
      return {};
    });

    const result = await rejectReview('review-123');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Review rejected successfully');
  });

  it('should return error when review not found', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'product_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        };
      }
      return {};
    });

    const result = await rejectReview('non-existent-review');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Review not found');
  });
});
