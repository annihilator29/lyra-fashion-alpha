import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="bg-[#3A3531] text-[#F5F3F0] py-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
    >
      {/* Social Media & Newsletter Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-playfair font-semibold">Follow Us</h3>
        <div className="flex gap-4">
          <a
            href="https://instagram.com/lyrafashion"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://facebook.com/lyrafashion"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Facebook"
            className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="https://twitter.com/lyrafashion"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Twitter"
            className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors"
          >
            <Twitter className="w-6 h-6" />
          </a>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-playfair font-semibold mb-4">Newsletter</h3>
          <NewsletterForm />
        </div>
      </div>

      {/* Company Section */}
      <div>
        <h3 className="text-lg font-playfair font-semibold mb-4">Company</h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/about"
              className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9B89E] rounded"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/factory-story"
              className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9B89E] rounded"
            >
              Factory Story
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9B89E] rounded"
            >
              Blog
            </Link>
          </li>
        </ul>
      </div>

      {/* Customer Service Section */}
      <div>
        <h3 className="text-lg font-playfair font-semibold mb-4">Customer Service</h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/contact"
              className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9B89E] rounded"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/shipping-returns"
              className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9B89E] rounded"
            >
              Shipping & Returns
            </Link>
          </li>
          <li>
            <Link
              href="/faq"
              className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9B89E] rounded"
            >
              FAQ
            </Link>
          </li>
        </ul>
      </div>

      {/* Legal Section */}
      <div>
        <h3 className="text-lg font-playfair font-semibold mb-4">Legal</h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/privacy-policy"
              className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9B89E] rounded"
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              href="/terms-of-service"
              className="text-[#F5F3F0] hover:text-[#C9B89E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9B89E] rounded"
            >
              Terms of Service
            </Link>
          </li>
        </ul>

        <div className="mt-8 pt-8 border-t border-[#5A5651]">
          <p className="text-sm text-[#F5F3F0]">
            © {currentYear} Lyra Fashion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
