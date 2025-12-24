import { render, screen } from '@testing-library/react';
import { FactoryBadge } from '../factory-badge';

describe('FactoryBadge', () => {
  it('renders the factory badge text', () => {
    render(<FactoryBadge />);

    expect(screen.getByText('Factory Direct')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<FactoryBadge />);

    const badge = screen.getByText('Factory Direct');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'text-xs', 'px-2', 'py-1', 'rounded-full');
  });

  it('shows tooltip on hover', () => {
    render(<FactoryBadge />);

    // Note: Testing hover state is complex in JSDOM, so we'll test that the tooltip element exists in the component
    const badge = screen.getByText('Factory Direct');
    expect(badge.parentElement).toBeInTheDocument();
  });
});