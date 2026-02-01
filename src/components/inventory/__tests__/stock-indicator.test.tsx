/**
 * Stock Indicator Component Tests
 * Story 6.2: Inventory Management & Sync (Task 8)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StockIndicator } from '../stock-indicator';

// Helper to create a mock function that can accept mockResolvedValueOnce
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMock(): any {
  return jest.fn();
}

// Create mock Supabase client
const createMockSupabase = () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    single: createMock(),
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
  })),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSupabase: any = createMockSupabase();

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('StockIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabase();
  });

  it('renders loading state initially', () => {
    render(<StockIndicator productId="6ba7b810-9dad-11d1-80b4-00c04fd430c8" />);
    
    // Should show skeleton loader
    // @ts-expect-error - jest-dom types not fully compatible with @jest/globals
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('displays "In Stock" when inventory is available', async () => {
    const mockInventory = {
      total_quantity: 100,
      reserved_quantity: 10,
      low_stock_threshold: 10,
    };

    const mockSingle = createMock();
    mockSingle.mockResolvedValueOnce({ data: mockInventory, error: null });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: mockSingle,
    });

    render(<StockIndicator productId="6ba7b810-9dad-11d1-80b4-00c04fd430c8" />);

    await waitFor(() => {
      // @ts-expect-error - jest-dom types not fully compatible with @jest/globals
      expect(screen.getByText(/In Stock/i)).toBeInTheDocument();
    });
  });

  it('displays "Out of Stock" when inventory is zero', async () => {
    const mockInventory = {
      total_quantity: 0,
      reserved_quantity: 0,
      low_stock_threshold: 10,
    };

    const mockSingle = createMock();
    mockSingle.mockResolvedValueOnce({ data: mockInventory, error: null });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: mockSingle,
    });

    render(<StockIndicator productId="6ba7b810-9dad-11d1-80b4-00c04fd430c8" />);

    await waitFor(() => {
      // @ts-expect-error - jest-dom types not fully compatible with @jest/globals
      expect(screen.getByText(/Out of Stock/i)).toBeInTheDocument();
    });
  });

  it('displays "Only X left" for low stock items', async () => {
    const mockInventory = {
      total_quantity: 8,
      reserved_quantity: 0,
      low_stock_threshold: 10,
    };

    const mockSingle = createMock();
    mockSingle.mockResolvedValueOnce({ data: mockInventory, error: null });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: mockSingle,
    });

    render(<StockIndicator productId="6ba7b810-9dad-11d1-80b4-00c04fd430c8" showQuantity={true} />);

    await waitFor(() => {
      // @ts-expect-error - jest-dom types not fully compatible with @jest/globals
      expect(screen.getByText(/Only 8 left/i)).toBeInTheDocument();
    });
  });

  it('displays "Stock unavailable" when inventory data is missing', async () => {
    const mockSingle = createMock();
    mockSingle.mockResolvedValueOnce({ data: null, error: null });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: mockSingle,
    });

    render(<StockIndicator productId="6ba7b810-9dad-11d1-80b4-00c04fd430c8" />);

    await waitFor(() => {
      // @ts-expect-error - jest-dom types not fully compatible with @jest/globals
      expect(screen.getByText(/Stock unavailable/i)).toBeInTheDocument();
    });
  });

  it('has proper ARIA label for accessibility', async () => {
    const mockInventory = {
      total_quantity: 0,
      reserved_quantity: 0,
      low_stock_threshold: 10,
    };

    const mockSingle = createMock();
    mockSingle.mockResolvedValueOnce({ data: mockInventory, error: null });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: mockSingle,
    });

    render(<StockIndicator productId="6ba7b810-9dad-11d1-80b4-00c04fd430c8" />);

    await waitFor(() => {
      const indicator = screen.getByLabelText(/Stock status: Out of stock/i);
      // @ts-expect-error - jest-dom types not fully compatible with @jest/globals
      expect(indicator).toBeInTheDocument();
    });
  });
});
