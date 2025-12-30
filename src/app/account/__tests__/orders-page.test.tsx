import { render, screen } from '@testing-library/react/pure';
import { redirect } from 'next/navigation';
import OrdersPage from '../../(public)/account/orders/page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('OrdersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    });

    await OrdersPage();
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('renders orders list when authenticated', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockOrders = [
      {
        id: 'order-1',
        customer_id: 'user-123',
        status: 'delivered',
        total: 12900,
        created_at: '2025-01-01T10:00:00Z',
        order_items: [],
      },
    ];

    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
    });

    await OrdersPage();
    expect(screen.getByText('Your Orders')).toBeInTheDocument();
  });

  it('handles empty orders array', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
    });

    await OrdersPage();
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });
});
