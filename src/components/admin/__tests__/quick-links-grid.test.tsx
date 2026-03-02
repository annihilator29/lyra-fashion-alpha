/**
 * Quick Links Grid Component Tests
 * Story 7.1a: Admin Dashboard - Foundation
 * AC4: Quick Navigation Links
 */

import { render, screen } from '@testing-library/react';
import { QuickLinksGrid } from '@/components/admin/quick-links-grid';
import { Package, Users } from 'lucide-react';

const mockLinks = [
  {
    title: 'Orders',
    description: 'Manage orders',
    href: '/admin/orders',
    icon: <Package data-testid="orders-icon" />,
  },
  {
    title: 'Customers',
    description: 'View customers',
    href: '/admin/customers',
    icon: <Users data-testid="customers-icon" />,
  },
];

describe('QuickLinksGrid', () => {
  it('should render all quick links', () => {
    render(<QuickLinksGrid links={mockLinks} />);

    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Manage orders')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('View customers')).toBeInTheDocument();
  });

  it('should render icons for each link', () => {
    render(<QuickLinksGrid links={mockLinks} />);

    expect(screen.getByTestId('orders-icon')).toBeInTheDocument();
    expect(screen.getByTestId('customers-icon')).toBeInTheDocument();
  });

  it('should have correct grid structure', () => {
    const { container } = render(<QuickLinksGrid links={mockLinks} />);
    
    const grid = container.querySelector('[data-testid="quick-links-grid"]');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-6');
  });

  it('should render links as clickable cards', () => {
    render(<QuickLinksGrid links={mockLinks} />);

    const orderLink = screen.getByText('Orders').closest('a');
    expect(orderLink).toHaveAttribute('href', '/admin/orders');
  });

  it('should handle empty links array', () => {
    const { container } = render(<QuickLinksGrid links={[]} />);
    
    const grid = container.querySelector('[data-testid="quick-links-grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid?.children.length).toBe(0);
  });
});
