import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ReviewFiltersComponent } from '../review-filters';
import type { ReviewFilters } from '@/lib/reviews/types';

describe('ReviewFiltersComponent', () => {
  const defaultFilters: ReviewFilters = {
    sort: 'newest',
    verifiedOnly: false,
  };

  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display sort by options', () => {
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    expect(screen.getByText(/Sort by:/)).toBeInTheDocument();
    expect(screen.getByText('Most Recent')).toBeInTheDocument();
  });

  it('should show all sort options in dropdown', async () => {
    const user = userEvent.setup();
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);

    expect(screen.getByText('Most Recent')).toBeInTheDocument();
    expect(screen.getByText('Highest Rating')).toBeInTheDocument();
    expect(screen.getByText('Lowest Rating')).toBeInTheDocument();
    expect(screen.getByText('Verified Purchases First')).toBeInTheDocument();
  });

  it('should call onChange when sort option is selected', async () => {
    const user = userEvent.setup();
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);

    const highestRatingOption = screen.getByText('Highest Rating');
    await user.click(highestRatingOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sort: 'highest',
      verifiedOnly: false,
    });
  });

  it('should call onChange for lowest rating sort', async () => {
    const user = userEvent.setup();
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);

    const lowestRatingOption = screen.getByText('Lowest Rating');
    await user.click(lowestRatingOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sort: 'lowest',
      verifiedOnly: false,
    });
  });

  it('should call onChange for verified purchases sort', async () => {
    const user = userEvent.setup();
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);

    const verifiedOption = screen.getByText('Verified Purchases First');
    await user.click(verifiedOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sort: 'verified',
      verifiedOnly: false,
    });
  });

  it('should display verified only filter checkbox', () => {
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    expect(screen.getByLabelText('Verified purchases only')).toBeInTheDocument();
  });

  it('should call onChange when verified only filter is toggled', async () => {
    const user = userEvent.setup();
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    const checkbox = screen.getByLabelText('Verified purchases only');
    await user.click(checkbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sort: 'newest',
      verifiedOnly: true,
    });
  });

  it('should call onChange when verified only filter is untoggled', async () => {
    const user = userEvent.setup();
    render(
      <ReviewFiltersComponent
        filters={{ ...defaultFilters, verifiedOnly: true }}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    const checkbox = screen.getByLabelText('Verified purchases only');
    await user.click(checkbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sort: 'newest',
      verifiedOnly: false,
    });
  });

  it('should display total reviews count', () => {
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
      />
    );

    expect(screen.getByText(/Showing 50 reviews/)).toBeInTheDocument();
  });

  it('should display singular form for single review', () => {
    render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={1}
      />
    );

    expect(screen.getByText(/Showing 1 review/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ReviewFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        totalReviews={50}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
