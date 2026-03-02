/**
 * Metric Card Component Tests
 * Story 7.1a: Admin Dashboard - Foundation
 * AC3: Key Metrics Display
 */

import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/admin/metric-card';
import { DollarSign } from 'lucide-react';

describe('MetricCard', () => {
  it('should render title and value', () => {
    render(
      <MetricCard
        title="Today's Revenue"
        value="$1,234.56"
        icon={<DollarSign data-testid="dollar-icon" />}
      />
    );

    expect(screen.getByText("Today's Revenue")).toBeInTheDocument();
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <MetricCard
        title="New Orders"
        value="42"
        subtitle="Pending orders today"
      />
    );

    expect(screen.getByText('Pending orders today')).toBeInTheDocument();
  });

  it('should show loading skeleton when isLoading is true', () => {
    render(
      <MetricCard
        title="Loading Metric"
        value="0"
        isLoading={true}
      />
    );

    expect(screen.getByTestId('metric-skeleton')).toBeInTheDocument();
  });

  it('should not show skeleton when isLoading is false', () => {
    render(
      <MetricCard
        title="Loaded Metric"
        value="100"
        isLoading={false}
      />
    );

    expect(screen.queryByTestId('metric-skeleton')).not.toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render with numeric value', () => {
    render(
      <MetricCard
        title="Count"
        value={42}
      />
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should have correct data-testid', () => {
    render(
      <MetricCard
        title="Test"
        value="0"
      />
    );

    expect(screen.getByTestId('metric-card')).toBeInTheDocument();
  });
});
