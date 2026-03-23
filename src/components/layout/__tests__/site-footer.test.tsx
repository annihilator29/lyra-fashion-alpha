import { render, screen } from '@testing-library/react';
import { ReactNode, AnchorHTMLAttributes } from 'react';
import { SiteFooter } from '../site-footer';

// Mock Next.js Link component
interface LinkMockProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
  href?: string | undefined;
}

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: LinkMockProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Instagram: () => <svg data-testid="instagram-icon" />,
  Facebook: () => <svg data-testid="facebook-icon" />,
}));

describe('SiteFooter', () => {
  it('renders footer element with semantic HTML', () => {
    render(<SiteFooter />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders with light theme styling', () => {
    render(<SiteFooter />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-[#f8f7f5]');
  });

  it('renders social media links with icons', () => {
    render(<SiteFooter />);

    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
  });

  it('opens social links in new tab', () => {
    render(<SiteFooter />);

    const instagramLink = screen.getByLabelText('Follow us on Instagram');
    expect(instagramLink).toHaveAttribute('target', '_blank');

    const facebookLink = screen.getByLabelText('Follow us on Facebook');
    expect(facebookLink).toHaveAttribute('target', '_blank');
  });

  it('renders navigation links grouped logically', () => {
    render(<SiteFooter />);

    // Shop links
    expect(screen.getByRole('link', { name: /new arrivals/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /collections/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /bestsellers/i })).toBeInTheDocument();

    // Information links
    expect(screen.getByRole('link', { name: /^shipping$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^returns$/i })).toBeInTheDocument();

    // About Us links
    expect(screen.getByRole('link', { name: /our story/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /atelier/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    const currentYear = new Date().getFullYear();
    render(<SiteFooter />);

    expect(screen.getByText(new RegExp(`${currentYear} LYRA`, 'i'))).toBeInTheDocument();
  });

  it('renders LYRA branding', () => {
    render(<SiteFooter />);

    const brandLinks = screen.getAllByRole('link', { name: /^LYRA$/i });
    expect(brandLinks.length).toBeGreaterThan(0);
  });

  it('includes ARIA labels for accessibility', () => {
    render(<SiteFooter />);

    expect(screen.getByLabelText('Follow us on Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow us on Facebook')).toBeInTheDocument();
  });
});
