import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ReviewCard } from '../review-card';
import type { Review } from '@/lib/reviews/types';

const mockReview: Review = {
  id: 'review-123',
  product_id: 'product-456',
  customer_id: 'customer-789',
  order_id: 'order-abc',
  rating: 5,
  title: 'Excellent quality and fit',
  content: 'I absolutely love this dress! The fabric is soft and the stitching is perfect. It fits true to size and looks even better in person than in the photos. I have received many compliments wearing it.',
  verified: true,
  status: 'approved',
  helpful_count: 12,
  fit_feedback: 'true-to-size',
  created_at: '2025-01-15T10:30:00Z',
  updated_at: '2025-01-15T10:30:00Z',
  customer: {
    name: 'Sarah Johnson',
  },
};

const mockOnMarkHelpful = jest.fn();

describe('ReviewCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display rating, title, and content', () => {
    render(
      <ReviewCard
        review={mockReview}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    expect(screen.getByText(mockReview.title)).toBeInTheDocument();
    expect(screen.getByText(mockReview.content)).toBeInTheDocument();
  });

  it('should show verified badge when verified is true', () => {
    render(
      <ReviewCard
        review={mockReview}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    expect(screen.getByText('Verified Purchase')).toBeInTheDocument();
  });

  it('should not show verified badge when verified is false', () => {
    const unverifiedReview = { ...mockReview, verified: false };
    render(
      <ReviewCard
        review={unverifiedReview}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    expect(screen.queryByText('Verified Purchase')).not.toBeInTheDocument();
  });

  it('should display customer name and date', () => {
    render(
      <ReviewCard
        review={mockReview}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2025')).toBeInTheDocument();
  });

  it('should display anonymous user when customer name is not provided', () => {
    const reviewWithoutCustomer = {
      ...mockReview,
      customer: undefined,
    };
    render(
      <ReviewCard
        review={reviewWithoutCustomer}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    expect(screen.getByText('Anonymous User')).toBeInTheDocument();
  });

  it('should display helpful count', () => {
    render(
      <ReviewCard
        review={mockReview}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    expect(screen.getByText(/Helpful \(12\)/)).toBeInTheDocument();
  });

  it('should increment helpful count when clicked', async () => {
    const user = userEvent.setup();
    mockOnMarkHelpful.mockResolvedValue(undefined);

    render(
      <ReviewCard
        review={mockReview}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    const helpfulButton = screen.getByRole('button', { name: /Helpful/i });
    await user.click(helpfulButton);

    await waitFor(() => {
      expect(mockOnMarkHelpful).toHaveBeenCalledWith('review-123');
      expect(screen.getByText(/Helpful \(13\)/)).toBeInTheDocument();
    });
  });

  it('should display fit feedback when provided', () => {
    render(
      <ReviewCard
        review={mockReview}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    expect(screen.getByText('Fit:')).toBeInTheDocument();
    expect(screen.getByText('Fits true to size')).toBeInTheDocument();
  });

  it('should not display fit feedback when n/a', () => {
    const reviewNoFit = { ...mockReview, fit_feedback: 'n/a' as const };
    render(
      <ReviewCard
        review={reviewNoFit}
        onMarkHelpful={mockOnMarkHelpful}
      />
    );

    expect(screen.queryByText('Fit:')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ReviewCard
        review={mockReview}
        onMarkHelpful={mockOnMarkHelpful}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
