import { render, screen } from '@testing-library/react';
import { ValuePropositionSection } from '../value-proposition-section';

describe('ValuePropositionSection', () => {
  const mockProposition = {
    title: 'Why Factory-Direct?',
    description: 'Experience the benefits of direct-from-source fashion',
    benefits: [
      {
        title: 'Better Pricing',
        description: 'Save 30-50% compared to traditional retail by eliminating middleman markups',
      },
      {
        title: 'Quality Assurance',
        description: 'Direct oversight of production ensures every piece meets our exacting standards',
      },
      {
        title: 'Transparent Process',
        description: 'See exactly how your garments are made from design to delivery',
      },
      {
        title: 'Artisan Connection',
        description: 'Support skilled craftspeople with fair wages and sustainable practices',
      },
    ],
  };

  it('renders value proposition title', () => {
    render(<ValuePropositionSection proposition={mockProposition} />);

    expect(screen.getByText('Why Factory-Direct?')).toBeInTheDocument();
  });

  it('renders value proposition description', () => {
    render(<ValuePropositionSection proposition={mockProposition} />);

    expect(
      screen.getByText('Experience the benefits of direct-from-source fashion')
    ).toBeInTheDocument();
  });

  it('renders all benefits', () => {
    const { container } = render(<ValuePropositionSection proposition={mockProposition} />);

    const headings = container.querySelectorAll('h3');
    expect(headings).toHaveLength(4);
  });
});
