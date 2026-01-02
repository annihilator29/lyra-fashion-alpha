import { render, screen } from '@testing-library/react';
import { CredentialsSection } from '../credentials-section';

describe('CredentialsSection', () => {
  const mockCredentials = [
    {
      type: 'certification' as const,
      title: 'ISO 9001 Certified',
      description: 'Quality management system certification',
      icon: '🏆',
    },
    {
      type: 'standard' as const,
      title: 'Fair Trade Practices',
      description: 'Ethical sourcing and labor practices',
      icon: '✓',
    },
    {
      type: 'practice' as const,
      title: 'Sustainable Materials',
      description: 'Eco-friendly fabric choices',
      icon: '🌱',
    },
  ];

  it('renders all credentials', () => {
    render(<CredentialsSection credentials={mockCredentials} />);

    expect(screen.getByText('ISO 9001 Certified')).toBeInTheDocument();
    expect(screen.getByText('Fair Trade Practices')).toBeInTheDocument();
    expect(screen.getByText('Sustainable Materials')).toBeInTheDocument();
  });

  it('renders credential descriptions', () => {
    render(<CredentialsSection credentials={mockCredentials} />);

    expect(screen.getByText('Quality management system certification')).toBeInTheDocument();
    expect(screen.getByText('Ethical sourcing and labor practices')).toBeInTheDocument();
    expect(screen.getByText('Eco-friendly fabric choices')).toBeInTheDocument();
  });

  it('renders credential icons as SVGs', () => {
    const { container } = render(<CredentialsSection credentials={mockCredentials} />);

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
