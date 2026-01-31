import { render, screen } from '@testing-library/react';
import { ReviewSummary } from '../review-summary';
import type { ReviewSummary as ReviewSummaryType } from '@/lib/reviews/types';

const mockSummary: ReviewSummaryType = {
  average_rating: 4.5,
  total_reviews: 128,
  rating_distribution: {
    5: 75,
    4: 32,
    3: 15,
    2: 4,
    1: 2,
  },
  verified_count: 120,
};

describe('ReviewSummary', () => {
  it('should display average rating', () => {
    render(<ReviewSummary summary={mockSummary} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should display total review count', () => {
    render(<ReviewSummary summary={mockSummary} />);

    expect(screen.getByText(/Based on 128 reviews/)).toBeInTheDocument();
  });

  it('should display verified purchases count', () => {
    render(<ReviewSummary summary={mockSummary} />);

    expect(screen.getByText('120 verified purchases')).toBeInTheDocument();
  });

  it('should render rating distribution bars', () => {
    render(<ReviewSummary summary={mockSummary} />);

    // Check for all star ratings
    expect(screen.getByText('5 star')).toBeInTheDocument();
    expect(screen.getByText('4 star')).toBeInTheDocument();
    expect(screen.getByText('3 star')).toBeInTheDocument();
    expect(screen.getByText('2 star')).toBeInTheDocument();
    expect(screen.getByText('1 star')).toBeInTheDocument();

    // Check for percentages
    expect(screen.getByText('59%')).toBeInTheDocument(); // 75/128
    expect(screen.getByText('25%')).toBeInTheDocument(); // 32/128
    expect(screen.getByText('12%')).toBeInTheDocument(); // 15/128
    expect(screen.getByText('3%')).toBeInTheDocument();  // 4/128
    expect(screen.getByText('2%')).toBeInTheDocument();  // 2/128
  });

  it('should handle zero total reviews', () => {
    const emptySummary: ReviewSummaryType = {
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
      verified_count: 0,
    };

    render(<ReviewSummary summary={emptySummary} />);

    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByText(/Based on 0 reviews/)).toBeInTheDocument();
  });

  it('should not show verified section when count is 0', () => {
    const noVerifiedSummary: ReviewSummaryType = {
      ...mockSummary,
      verified_count: 0,
    };

    render(<ReviewSummary summary={noVerifiedSummary} />);

    expect(screen.queryByText(/verified/)).not.toBeInTheDocument();
  });

  it('should handle single review', () => {
    const singleReviewSummary: ReviewSummaryType = {
      average_rating: 5,
      total_reviews: 1,
      rating_distribution: {
        5: 1,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
      verified_count: 1,
    };

    render(<ReviewSummary summary={singleReviewSummary} />);

    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText(/Based on 1 review/)).toBeInTheDocument();
    expect(screen.getByText('1 verified purchase')).toBeInTheDocument();
  });

  it('should return null when summary is null', () => {
    const { container } = render(<ReviewSummary summary={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ReviewSummary summary={mockSummary} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
