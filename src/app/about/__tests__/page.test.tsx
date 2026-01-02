import { render, screen } from '@testing-library/react';
import AboutPage from '../page';

// Mock the components that will be created later
jest.mock('@/components/layout/hero-section', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero</div>,
}));

jest.mock('@/components/transparency/factory-timeline', () => ({
  FactoryTimeline: () => <div data-testid="factory-timeline">Timeline</div>,
}));

jest.mock('@/components/transparency/photo-gallery', () => ({
  PhotoGallery: () => <div data-testid="photo-gallery">Gallery</div>,
}));

jest.mock('@/components/transparency/credentials-section', () => ({
  CredentialsSection: () => <div data-testid="credentials-section">Credentials</div>,
}));

jest.mock('@/components/transparency/value-proposition-section', () => ({
  ValuePropositionSection: () => <div data-testid="value-proposition-section">Value Proposition</div>,
}));

describe('About Page', () => {
  it('renders the about page with hero section', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('renders the factory timeline', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('factory-timeline')).toBeInTheDocument();
  });

  it('renders the photo gallery', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
  });

  it('contains appropriate heading', () => {
    render(<AboutPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders credentials section', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('credentials-section')).toBeInTheDocument();
  });

  it('renders value proposition section', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('value-proposition-section')).toBeInTheDocument();
  });

  it('contains CTA buttons', () => {
    render(<AboutPage />);
    expect(screen.getByRole('link', { name: 'Shop Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More About Our Process' })).toBeInTheDocument();
  });
});
