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
  Twitter: () => <svg data-testid="twitter-icon" />,
}));

describe('SiteFooter', () => {
  it('renders footer element with semantic HTML', () => {
    render(<SiteFooter />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders with dark theme styling', () => {
    render(<SiteFooter />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-[#3A3531]');
  });

  it('renders social media links with icons', () => {
    render(<SiteFooter />);

    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
  });

  it('opens social links in new tab', () => {
    render(<SiteFooter />);

    const instagramLink = screen.getByLabelText('Follow us on Instagram');
    expect(instagramLink).toHaveAttribute('target', '_blank');

    const facebookLink = screen.getByLabelText('Follow us on Facebook');
    expect(facebookLink).toHaveAttribute('target', '_blank');

    const twitterLink = screen.getByLabelText('Follow us on Twitter');
    expect(twitterLink).toHaveAttribute('target', '_blank');
  });

  it('renders newsletter form component', () => {
    render(<SiteFooter />);

    const emailInput = screen.getByLabelText('Email address for newsletter subscription');
    expect(emailInput).toBeInTheDocument();

    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    expect(subscribeButton).toBeInTheDocument();
  });

  it('renders navigation links grouped logically', () => {
    render(<SiteFooter />);

    // Company links
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /factory story/i })).toBeInTheDocument();

    // Customer Service links
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shipping.*returns/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /faq/i })).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    const currentYear = new Date().getFullYear();
    render(<SiteFooter />);

    expect(screen.getByText(new RegExp(`© ${currentYear} Lyra Fashion`, 'i'))).toBeInTheDocument();
  });

  it('has responsive layout classes', () => {
    render(<SiteFooter />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('grid');
    expect(footer).toHaveClass('grid-cols-1');
  });

  it('includes ARIA labels for accessibility', () => {
    render(<SiteFooter />);

    // Social media links
    expect(screen.getByLabelText('Follow us on Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow us on Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow us on Twitter')).toBeInTheDocument();

    // Newsletter form
    expect(screen.getByLabelText('Email address for newsletter subscription')).toBeInTheDocument();
  });

  it('renders NewsletterForm as child component', () => {
    render(<SiteFooter />);

    const emailInput = screen.getByLabelText('Email address for newsletter subscription');
    expect(emailInput).toBeInTheDocument();
  });
});
