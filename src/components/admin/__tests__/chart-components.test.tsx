/**
 * Chart Component Tests
 * Story 7.1b: Admin Dashboard - Data Visualization
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock recharts to avoid canvas rendering issues in jsdom
jest.mock('recharts', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'responsive-container' }, children),
    AreaChart: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'area-chart' }, children),
    LineChart: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'line-chart' }, children),
    BarChart: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'bar-chart' }, children),
    PieChart: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'pie-chart' }, children),
    Area: () => null,
    Line: () => null,
    Bar: () => null,
    Pie: ({ label }: { label?: (props: Record<string, unknown>) => React.ReactNode }) => {
      if (label && typeof label === 'function') {
        return React.createElement(
          'div',
          { 'data-testid': 'pie' },
          label({ viewBox: { cx: 100, cy: 100 } })
        );
      }
      return React.createElement('div', { 'data-testid': 'pie' });
    },
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: ({ content }: { content?: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'legend' }, content),
  };
});

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return (importFn: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    const Component = React.lazy(importFn);
    return function DynamicComponent(props: Record<string, unknown>) {
      return React.createElement(
        React.Suspense,
        { fallback: React.createElement('div', null, 'Loading...') },
        React.createElement(Component, props)
      );
    };
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// ---------------------------------------------------------------------------
// Import components after mocks are set up
// ---------------------------------------------------------------------------
import RevenueChart from '@/components/admin/revenue-chart';
import TopProductsChart from '@/components/admin/top-products-chart';
import CustomerGrowthChart from '@/components/admin/customer-growth-chart';
import OrderStatusChart from '@/components/admin/order-status-chart';

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------
const mockSalesTrends = [
  { date: '2026-01-01', revenue: 10000 },
  { date: '2026-01-02', revenue: 15000 },
  { date: '2026-01-03', revenue: 8000 },
];

const mockTopProducts = [
  { id: 'p1', name: 'Silk Blouse', revenue: 50000 },
  { id: 'p2', name: 'Linen Jacket', revenue: 35000 },
];

const mockCustomerGrowth = [
  { date: '2026-01-01', newSignups: 5, activeUsers: 20 },
  { date: '2026-01-02', newSignups: 3, activeUsers: 22 },
];

const mockOrderStatus = [
  { status: 'delivered' as const, count: 50, percentage: 50 },
  { status: 'pending' as const, count: 30, percentage: 30 },
  { status: 'processing' as const, count: 20, percentage: 20 },
];

// ---------------------------------------------------------------------------
// RevenueChart
// ---------------------------------------------------------------------------
describe('RevenueChart', () => {
  const noop = jest.fn();

  it('renders chart with data', () => {
    render(
      <RevenueChart data={mockSalesTrends} timeRange="daily" onTimeRangeChange={noop} />
    );
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
  });

  it('shows empty state when fewer than 2 data points', () => {
    render(
      <RevenueChart data={[mockSalesTrends[0]]} timeRange="daily" onTimeRangeChange={noop} />
    );
    expect(screen.getByTestId('revenue-chart-empty')).toBeInTheDocument();
    expect(screen.getByText('Need more data to display trends')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<RevenueChart data={[]} timeRange="daily" onTimeRangeChange={noop} />);
    expect(screen.getByTestId('revenue-chart-empty')).toBeInTheDocument();
  });

  it('calls onTimeRangeChange when Weekly toggle is clicked', () => {
    const mockFn = jest.fn();
    render(
      <RevenueChart data={mockSalesTrends} timeRange="daily" onTimeRangeChange={mockFn} />
    );
    fireEvent.click(screen.getByText('Weekly'));
    expect(mockFn).toHaveBeenCalledWith('weekly');
  });

  it('calls onTimeRangeChange when Monthly toggle is clicked', () => {
    const mockFn = jest.fn();
    render(
      <RevenueChart data={mockSalesTrends} timeRange="daily" onTimeRangeChange={mockFn} />
    );
    fireEvent.click(screen.getByText('Monthly'));
    expect(mockFn).toHaveBeenCalledWith('monthly');
  });

  it('shows skeleton when isLoading is true', () => {
    const { container } = render(
      <RevenueChart data={mockSalesTrends} timeRange="daily" onTimeRangeChange={noop} isLoading />
    );
    // Skeleton renders without the chart testid
    expect(container.querySelector('[data-testid="revenue-chart"]')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// TopProductsChart
// ---------------------------------------------------------------------------
describe('TopProductsChart', () => {
  const noop = jest.fn();

  it('renders chart with product data', () => {
    render(<TopProductsChart data={mockTopProducts} onViewAll={noop} />);
    expect(screen.getByTestId('top-products-chart')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<TopProductsChart data={[]} onViewAll={noop} />);
    expect(screen.getByTestId('top-products-empty')).toBeInTheDocument();
    expect(screen.getByText('No delivered orders yet')).toBeInTheDocument();
  });

  it('calls onViewAll when View All button is clicked', () => {
    const mockFn = jest.fn();
    render(<TopProductsChart data={mockTopProducts} onViewAll={mockFn} />);
    fireEvent.click(screen.getByText(/View All Products/i));
    expect(mockFn).toHaveBeenCalled();
  });

  it('shows skeleton when isLoading is true', () => {
    const { container } = render(
      <TopProductsChart data={mockTopProducts} onViewAll={noop} isLoading />
    );
    expect(
      container.querySelector('[data-testid="top-products-chart"]')
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CustomerGrowthChart
// ---------------------------------------------------------------------------
describe('CustomerGrowthChart', () => {
  const noop = jest.fn();

  it('renders chart with customer growth data', () => {
    render(
      <CustomerGrowthChart data={mockCustomerGrowth} timeRange="daily" onTimeRangeChange={noop} />
    );
    expect(screen.getByTestId('customer-growth-chart')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<CustomerGrowthChart data={[]} timeRange="daily" onTimeRangeChange={noop} />);
    expect(screen.getByTestId('customer-growth-empty')).toBeInTheDocument();
    expect(screen.getByText('No customer data available')).toBeInTheDocument();
  });

  it('calls onTimeRangeChange when Weekly is clicked', () => {
    const mockFn = jest.fn();
    render(
      <CustomerGrowthChart
        data={mockCustomerGrowth}
        timeRange="daily"
        onTimeRangeChange={mockFn}
      />
    );
    fireEvent.click(screen.getByText('Weekly'));
    expect(mockFn).toHaveBeenCalledWith('weekly');
  });

  it('shows skeleton when isLoading is true', () => {
    const { container } = render(
      <CustomerGrowthChart
        data={mockCustomerGrowth}
        timeRange="daily"
        onTimeRangeChange={noop}
        isLoading
      />
    );
    expect(
      container.querySelector('[data-testid="customer-growth-chart"]')
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// OrderStatusChart
// ---------------------------------------------------------------------------
describe('OrderStatusChart', () => {
  it('renders chart with status data', () => {
    render(<OrderStatusChart data={mockOrderStatus} />);
    expect(screen.getByTestId('order-status-chart')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<OrderStatusChart data={[]} />);
    expect(screen.getByTestId('order-status-empty')).toBeInTheDocument();
    expect(screen.getByText('No orders in last 30 days')).toBeInTheDocument();
  });

  it('shows skeleton when isLoading is true', () => {
    const { container } = render(<OrderStatusChart data={mockOrderStatus} isLoading />);
    expect(
      container.querySelector('[data-testid="order-status-chart"]')
    ).not.toBeInTheDocument();
  });
});
