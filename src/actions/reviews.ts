'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  reviewSubmissionSchema, 
  type ReviewSubmissionData,
  type ReviewSubmissionResponse 
} from '@/lib/reviews/validation';
import { verifyReviewToken } from '@/lib/reviews/tokens';
import { requireAdmin } from '@/lib/auth/roles';
import { updateProductAggregates } from '@/lib/reviews/queries';

// Admin Review Moderation Action Types
export interface ModerationActionResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface BulkModerationResponse {
  success: boolean;
  message: string;
  processedCount: number;
  failedCount: number;
  errors?: string[];
}

/**
 * Submit a product review
 * This server action validates the input, verifies the token,
 * checks order ownership, prevents duplicates, and inserts the review
 */
export async function submitProductReview(
  data: ReviewSubmissionData
): Promise<ReviewSubmissionResponse> {
  try {
    // Validate input with Zod
    const validationResult = reviewSubmissionSchema.safeParse(data);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(', ');
      return {
        success: false,
        message: 'Validation failed',
        error: errorMessages,
      };
    }

    const { rating, title, content, fitFeedback, token } = validationResult.data;

    // Verify the review token
    const tokenPayload = await verifyReviewToken(token);
    
    if (!tokenPayload) {
      return {
        success: false,
        message: 'Invalid or expired review token',
        error: 'The review link is no longer valid. Please request a new review link.',
      };
    }

    const { orderId, productId, customerId } = tokenPayload;
    
    // Use admin client to bypass RLS for token-based authentication
    // This allows users to submit reviews via email link without logging in
    const supabase = createAdminClient();

    // Check order ownership and delivery status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, customer_id, delivered_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        message: 'Order not found',
        error: 'Could not verify your order. Please contact support.',
      };
    }

    // Verify order belongs to the customer
    if (order.customer_id !== customerId) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'This review token does not belong to your account.',
      };
    }

    // Check if order is delivered
    if (order.status !== 'delivered' && !order.delivered_at) {
      return {
        success: false,
        message: 'Order not delivered',
        error: 'You can only review products after they have been delivered.',
      };
    }

    // Check for existing review (duplicate prevention)
    const { data: existingReview, error: existingError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingError) {
      return {
        success: false,
        message: 'Error checking existing review',
        error: 'Could not verify if review already exists.',
      };
    }

    if (existingReview) {
      return {
        success: false,
        message: 'Review already submitted',
        error: 'You have already submitted a review for this product.',
      };
    }

    // Get product slug for revalidation
    const { data: product } = await supabase
      .from('products')
      .select('slug, category')
      .eq('id', productId)
      .single();

    // Insert review with status 'pending'
    const { data: review, error: insertError } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        customer_id: customerId,
        order_id: orderId,
        rating,
        title,
        content,
        fit_feedback: fitFeedback,
        status: 'pending',
        verified: true, // Mark as verified since it came from an order
        helpful_count: 0,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return {
        success: false,
        message: 'Failed to submit review',
        error: 'An error occurred while saving your review. Please try again.',
      };
    }

    // Revalidate product page to show updated review count (once approved)
    if (product) {
      revalidatePath(`/products/${product.category}/${product.slug}`);
    }
    revalidatePath(`/products/${product?.slug || ''}`);

    return {
      success: true,
      message: 'Review submitted successfully',
      reviewId: review.id,
    };
  } catch (error) {
    console.error('Unexpected error in submitProductReview:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'Please try again later or contact support if the problem persists.',
    };
  }
}

// ============================================================================
// ADMIN REVIEW MODERATION ACTIONS
// ============================================================================

/**
 * Approve a review
 * Updates status to 'approved' and recalculates product aggregates
 */
export async function approveReview(reviewId: string): Promise<ModerationActionResponse> {
  try {
    // Verify admin access
    await requireAdmin();

    const supabase = await createClient();

    // Get the review to find product_id
    const { data: review, error: fetchError } = await supabase
      .from('product_reviews')
      .select('product_id, status')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return {
        success: false,
        message: 'Review not found',
        error: 'Could not find the review to approve.',
      };
    }

    // Update review status
    const { error: updateError } = await supabase
      .from('product_reviews')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error approving review:', updateError);
      return {
        success: false,
        message: 'Failed to approve review',
        error: 'An error occurred while approving the review.',
      };
    }

    // Update product aggregates
    await updateProductAggregates(review.product_id);

    // Revalidate paths
    revalidatePath('/admin/reviews');
    revalidatePath('/products/[slug]', 'page');

    return {
      success: true,
      message: 'Review approved successfully',
    };
  } catch (error) {
    console.error('Unexpected error in approveReview:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'Please try again later or contact support.',
    };
  }
}

/**
 * Reject a review
 * Updates status to 'rejected' and logs the rejection reason
 */
export async function rejectReview(
  reviewId: string,
  reason?: string
): Promise<ModerationActionResponse> {
  try {
    // Verify admin access
    await requireAdmin();

    const supabase = await createClient();

    // Get the review to find product_id
    const { data: review, error: fetchError } = await supabase
      .from('product_reviews')
      .select('product_id, status')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return {
        success: false,
        message: 'Review not found',
        error: 'Could not find the review to reject.',
      };
    }

    // Update review status
    const { error: updateError } = await supabase
      .from('product_reviews')
      .update({
        status: 'rejected',
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error rejecting review:', updateError);
      return {
        success: false,
        message: 'Failed to reject review',
        error: 'An error occurred while rejecting the review.',
      };
    }

    // Revalidate paths
    revalidatePath('/admin/reviews');

    return {
      success: true,
      message: 'Review rejected successfully',
    };
  } catch (error) {
    console.error('Unexpected error in rejectReview:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'Please try again later or contact support.',
    };
  }
}

/**
 * Delete a review
 * Performs a hard delete with confirmation required
 */
export async function deleteReview(reviewId: string): Promise<ModerationActionResponse> {
  try {
    // Verify admin access
    await requireAdmin();

    const supabase = await createClient();

    // Get the review to find product_id (for revalidation)
    const { data: review, error: fetchError } = await supabase
      .from('product_reviews')
      .select('product_id, status')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return {
        success: false,
        message: 'Review not found',
        error: 'Could not find the review to delete.',
      };
    }

    // Delete the review
    const { error: deleteError } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return {
        success: false,
        message: 'Failed to delete review',
        error: 'An error occurred while deleting the review.',
      };
    }

    // If the review was approved, update product aggregates
    if (review.status === 'approved') {
      await updateProductAggregates(review.product_id);
    }

    // Revalidate paths
    revalidatePath('/admin/reviews');
    revalidatePath('/products/[slug]', 'page');

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  } catch (error) {
    console.error('Unexpected error in deleteReview:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'Please try again later or contact support.',
    };
  }
}

/**
 * Bulk approve multiple reviews
 */
export async function bulkApproveReviews(reviewIds: string[]): Promise<BulkModerationResponse> {
  try {
    // Verify admin access
    await requireAdmin();

    if (!reviewIds.length) {
      return {
        success: false,
        message: 'No reviews selected',
        processedCount: 0,
        failedCount: 0,
      };
    }

    const supabase = await createClient();
    const errors: string[] = [];
    let processedCount = 0;
    const updatedProductIds = new Set<string>();

    // Process each review
    for (const reviewId of reviewIds) {
      try {
        // Get the review
        const { data: review, error: fetchError } = await supabase
          .from('product_reviews')
          .select('product_id')
          .eq('id', reviewId)
          .single();

        if (fetchError || !review) {
          errors.push(`Review ${reviewId}: Not found`);
          continue;
        }

        // Update status
        const { error: updateError } = await supabase
          .from('product_reviews')
          .update({
            status: 'approved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', reviewId);

        if (updateError) {
          errors.push(`Review ${reviewId}: ${updateError.message}`);
          continue;
        }

        updatedProductIds.add(review.product_id);
        processedCount++;
      } catch (err) {
        errors.push(`Review ${reviewId}: ${(err as Error).message}`);
      }
    }

    // Update aggregates for all affected products
    for (const productId of updatedProductIds) {
      try {
        await updateProductAggregates(productId);
      } catch (err) {
        console.error(`Failed to update aggregates for product ${productId}:`, err);
      }
    }

    // Revalidate paths
    revalidatePath('/admin/reviews');
    revalidatePath('/products/[slug]', 'page');

    return {
      success: processedCount > 0,
      message: `${processedCount} review${processedCount === 1 ? '' : 's'} approved successfully`,
      processedCount,
      failedCount: reviewIds.length - processedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Unexpected error in bulkApproveReviews:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      processedCount: 0,
      failedCount: reviewIds.length,
      errors: ['Please try again later or contact support.'],
    };
  }
}

/**
 * Bulk reject multiple reviews
 */
export async function bulkRejectReviews(
  reviewIds: string[],
  reason?: string
): Promise<BulkModerationResponse> {
  try {
    // Verify admin access
    await requireAdmin();

    if (!reviewIds.length) {
      return {
        success: false,
        message: 'No reviews selected',
        processedCount: 0,
        failedCount: 0,
      };
    }

    const supabase = await createClient();
    const errors: string[] = [];
    let processedCount = 0;

    // Process each review
    for (const reviewId of reviewIds) {
      try {
        const { error: updateError } = await supabase
          .from('product_reviews')
          .update({
            status: 'rejected',
            rejection_reason: reason || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reviewId);

        if (updateError) {
          errors.push(`Review ${reviewId}: ${updateError.message}`);
          continue;
        }

        processedCount++;
      } catch (err) {
        errors.push(`Review ${reviewId}: ${(err as Error).message}`);
      }
    }

    // Revalidate paths
    revalidatePath('/admin/reviews');

    return {
      success: processedCount > 0,
      message: `${processedCount} review${processedCount === 1 ? '' : 's'} rejected successfully`,
      processedCount,
      failedCount: reviewIds.length - processedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Unexpected error in bulkRejectReviews:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      processedCount: 0,
      failedCount: reviewIds.length,
      errors: ['Please try again later or contact support.'],
    };
  }
}
