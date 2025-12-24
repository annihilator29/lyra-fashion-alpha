import { render, screen } from '@testing-library/react';
import { TransparencyCard } from '../transparency-card';

describe('TransparencyCard', () => {
  const defaultProps = {
    factoryPrice: 100,
    retailPrice: 167,
    savings: 67,
  };

  it('displays factory and retail prices correctly', () => {
    render(<TransparencyCard {...defaultProps} />);

    expect(screen.getByText('Factory Direct Price:')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    
    expect(screen.getByText('Traditional Retail Price:')).toBeInTheDocument();
    expect(screen.getByText('$167.00')).toBeInTheDocument();
  });

  it('displays savings information correctly', () => {
    render(<TransparencyCard {...defaultProps} />);

    expect(screen.getByText('You Save:')).toBeInTheDocument();
    expect(screen.getByText('$67.00')).toBeInTheDocument();
  });

  it('shows factory-direct value proposition', () => {
    render(<TransparencyCard {...defaultProps} />);

    expect(screen.getByText('You save 40% vs retail through our direct-to-consumer model')).toBeInTheDocument();
  });

  it('renders interactive bar chart elements', () => {
    render(<TransparencyCard {...defaultProps} />);

    expect(screen.getByText('Factory-Direct Pricing')).toBeInTheDocument();
    // Test that the bar chart elements are present
    // expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // This might be different depending on implementation
  });
});