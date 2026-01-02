import { render, screen } from '@testing-library/react';
import { HeroSection } from '../hero-section';

describe('HeroSection', () => {
  it('renders hero section with title', () => {
    render(
      <HeroSection
        title="Test Title"
        subtitle="Test Subtitle"
        image="/test.jpg"
        cta={{ text: 'Click Me', link: '#test' }}
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders hero section with subtitle', () => {
    render(
      <HeroSection
        title="Test Title"
        subtitle="Test Subtitle"
        image="/test.jpg"
        cta={{ text: 'Click Me', link: '#test' }}
      />
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    render(
      <HeroSection
        title="Test Title"
        subtitle="Test Subtitle"
        image="/test.jpg"
        cta={{ text: 'Click Me', link: '#test' }}
      />
    );
    const link = screen.getByRole('link', { name: 'Click Me' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#test');
  });

  it('renders hero image', () => {
    render(
      <HeroSection
        title="Test Title"
        subtitle="Test Subtitle"
        image="/test.jpg"
        cta={{ text: 'Click Me', link: '#test' }}
      />
    );
    const image = screen.getByAltText('Test Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('test.jpg'));
  });
});
