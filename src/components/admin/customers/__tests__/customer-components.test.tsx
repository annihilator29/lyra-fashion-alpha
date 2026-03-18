/**
 * Customer Components Tests
 * Story 7.4a: Customer Lookup & Profile
 * 
 * Tests for customer UI components:
 * - CustomerHeader
 * - CustomerStatsCard
 * - CustomerAddresses
 * - CustomerPreferences
 * - CustomerOrders
 * - CustomersTable
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

declare module '@jest/expect' {
  interface Matchers<R> {
    toBeInTheDocument(): R;
  }
}

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/admin/customers/test-id'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

describe('Customer Components', () => {
  describe('CustomerHeader', () => {
    it('should render customer name and email', async () => {
      const { CustomerHeader } = await import('@/components/admin/customers/customer-header');

      render(
        <CustomerHeader
          customer={{
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            phone_number: null,
            created_at: '2024-01-01T00:00:00Z',
            segment: 'VIP',
          }}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should display segment badge', async () => {
      const { CustomerHeader } = await import('@/components/admin/customers/customer-header');

      render(
        <CustomerHeader
          customer={{
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com',
            phone: null,
            phone_number: null,
            created_at: '2024-01-01T00:00:00Z',
            segment: 'Regular',
          }}
        />
      );

      expect(screen.getByText('Regular Customer')).toBeInTheDocument();
    });

    it('should handle missing name gracefully', async () => {
      const { CustomerHeader } = await import('@/components/admin/customers/customer-header');

      render(
        <CustomerHeader
          customer={{
            first_name: null,
            last_name: null,
            email: 'anonymous@example.com',
            phone: null,
            phone_number: null,
            created_at: '2024-01-01T00:00:00Z',
            segment: 'New',
          }}
        />
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('CustomerStatsCard', () => {
    it('should display lifetime value correctly', async () => {
      const { CustomerStatsCard } = await import('@/components/admin/customers/customer-stats-card');

      render(
        <CustomerStatsCard
          customer={{
            lifetime_value: 15000,
            order_count: 5,
            last_order_date: '2024-01-15T00:00:00Z',
          }}
        />
      );

      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    it('should display order count', async () => {
      const { CustomerStatsCard } = await import('@/components/admin/customers/customer-stats-card');

      render(
        <CustomerStatsCard
          customer={{
            lifetime_value: 0,
            order_count: 10,
            last_order_date: null,
          }}
        />
      );

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle no orders', async () => {
      const { CustomerStatsCard } = await import('@/components/admin/customers/customer-stats-card');

      render(
        <CustomerStatsCard
          customer={{
            lifetime_value: 0,
            order_count: 0,
            last_order_date: null,
          }}
        />
      );

      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });
  });

  describe('CustomerAddresses', () => {
    it('should display customer addresses', async () => {
      const { CustomerAddresses } = await import('@/components/admin/customers/customer-addresses');

      render(
        <CustomerAddresses
          addresses={[
            {
              id: 'addr-1',
              name: 'John Doe',
              address_line1: '123 Main St',
              address_line2: null,
              city: 'New York',
              state: 'NY',
              postal_code: '10001',
              country: 'US',
              phone: '1234567890',
              is_default: true,
            },
          ]}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('should handle empty addresses', async () => {
      const { CustomerAddresses } = await import('@/components/admin/customers/customer-addresses');

      render(<CustomerAddresses addresses={[]} />);

      expect(screen.getByText('No saved addresses found.')).toBeInTheDocument();
    });
  });

  describe('CustomerPreferences', () => {
    it('should display email preferences', async () => {
      const { CustomerPreferences } = await import('@/components/admin/customers/customer-preferences');

      render(
        <CustomerPreferences
          customer={{
            email_preferences: {
              marketing_opt_in: true,
              order_updates: true,
              promotional_emails: false,
            },
            preferences: {},
          }}
        />
      );

      expect(screen.getByText('Newsletter Subscription')).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    it('should handle missing preferences', async () => {
      const { CustomerPreferences } = await import('@/components/admin/customers/customer-preferences');

      render(
        <CustomerPreferences
          customer={{
            email_preferences: null,
            preferences: null,
          }}
        />
      );

      const notSetElements = screen.getAllByText('Not set');
      expect(notSetElements.length).toBeGreaterThan(0);
      expect(notSetElements[0]).toBeInTheDocument();
    });
  });
});
