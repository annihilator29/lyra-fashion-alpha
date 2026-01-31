/**
 * Review Moderation Actions Component
 * 
 * Provides Approve, Reject, and Delete action buttons with confirmation dialogs.
 * Includes loading states and toast notifications.
 * 
 * @module components/admin/review-moderation-actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  approveReview,
  rejectReview,
  deleteReview,
  type ModerationActionResponse,
} from '@/actions/reviews';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface ReviewModerationActionsProps {
  reviewId: string;
  currentStatus: 'pending' | 'approved' | 'rejected';
  onActionComplete?: () => void;
  variant?: 'default' | 'compact';
}

/**
 * Single review moderation actions (Approve/Reject/Delete)
 */
export function ReviewModerationActions({
  reviewId,
  currentStatus,
  onActionComplete,
  variant = 'default',
}: ReviewModerationActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const result: ModerationActionResponse = await approveReview(reviewId);
      if (result.success) {
        toast.success('Review approved', {
          description: 'The review has been approved and is now visible on the product page.',
        });
        onActionComplete?.();
        router.refresh();
      } else {
        toast.error('Failed to approve review', {
          description: result.error || result.message,
        });
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const result: ModerationActionResponse = await rejectReview(
        reviewId,
        rejectReason.trim() || undefined
      );
      if (result.success) {
        toast.success('Review rejected', {
          description: rejectReason
            ? 'The review has been rejected with a reason.'
            : 'The review has been rejected.',
        });
        setIsRejectDialogOpen(false);
        setRejectReason('');
        onActionComplete?.();
        router.refresh();
      } else {
        toast.error('Failed to reject review', {
          description: result.error || result.message,
        });
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result: ModerationActionResponse = await deleteReview(reviewId);
      if (result.success) {
        toast.success('Review deleted', {
          description: 'The review has been permanently deleted.',
        });
        setIsDeleteDialogOpen(false);
        onActionComplete?.();
        router.refresh();
      } else {
        toast.error('Failed to delete review', {
          description: result.error || result.message,
        });
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {currentStatus !== 'approved' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleApprove}
            disabled={isLoading}
            title="Approve review"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>
        )}

        {currentStatus !== 'rejected' && (
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                disabled={isLoading}
                title="Reject review"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-orange-500" />
                  Reject Review
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to reject this review? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reject-reason">Rejection Reason (Optional)</Label>
                  <Textarea
                    id="reject-reason"
                    placeholder="Enter a reason for rejecting this review..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleReject}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Review'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isLoading}
              title="Delete review"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Review Permanently
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. The review will be permanently removed from the database.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Warning:</p>
                <p>
                  Deleting this review will also remove it from the product&apos;s review count and
                  rating calculation if it was previously approved.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Default variant - full buttons
  return (
    <div className="flex items-center gap-2">
      {currentStatus !== 'approved' && (
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 border-green-600 hover:bg-green-50"
          onClick={handleApprove}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Approve
        </Button>
      )}

      {currentStatus !== 'rejected' && (
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-orange-500" />
                Reject Review
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this review? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Rejection Reason (Optional)</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Enter a reason for rejecting this review..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleReject}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Review'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-600 hover:bg-red-50"
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Review Permanently
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The review will be permanently removed from the database.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Warning:</p>
              <p>
                Deleting this review will also remove it from the product&apos;s review count and
                rating calculation if it was previously approved.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BulkReviewActionsProps {
  selectedReviewIds: string[];
  onActionComplete?: () => void;
  clearSelection?: () => void;
}

/**
 * Bulk review moderation actions for multiple selected reviews
 */
export function BulkReviewActions({
  selectedReviewIds,
  onActionComplete,
  clearSelection,
}: BulkReviewActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  if (selectedReviewIds.length === 0) {
    return null;
  }

  const handleBulkApprove = async () => {
    setIsLoading(true);
    try {
      const { bulkApproveReviews } = await import('@/actions/reviews');
      const result = await bulkApproveReviews(selectedReviewIds);
      if (result.success) {
        toast.success('Reviews approved', {
          description: `${result.processedCount} review${
            result.processedCount === 1 ? '' : 's'
          } approved successfully.`,
        });
        clearSelection?.();
        onActionComplete?.();
        router.refresh();
      } else {
        toast.error('Failed to approve reviews', {
          description: result.message,
        });
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReject = async () => {
    setIsLoading(true);
    try {
      const { bulkRejectReviews } = await import('@/actions/reviews');
      const result = await bulkRejectReviews(
        selectedReviewIds,
        rejectReason.trim() || undefined
      );
      if (result.success) {
        toast.success('Reviews rejected', {
          description: `${result.processedCount} review${
            result.processedCount === 1 ? '' : 's'
          } rejected successfully.`,
        });
        setIsRejectDialogOpen(false);
        setRejectReason('');
        clearSelection?.();
        onActionComplete?.();
        router.refresh();
      } else {
        toast.error('Failed to reject reviews', {
          description: result.message,
        });
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
      <span className="text-sm text-muted-foreground px-2">
        {selectedReviewIds.length} selected
      </span>

      <Button
        variant="outline"
        size="sm"
        className="text-green-600 border-green-600 hover:bg-green-50"
        onClick={handleBulkApprove}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        Approve All
      </Button>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
            disabled={isLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject All
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-500" />
              Reject {selectedReviewIds.length} Reviews
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject these {selectedReviewIds.length} reviews? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-reject-reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="bulk-reject-reason"
                placeholder="Enter a reason for rejecting these reviews..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleBulkReject}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                `Reject ${selectedReviewIds.length} Reviews`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
