import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-[#f8f7f5] pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="mb-6 inline-block font-serif text-2xl font-semibold tracking-widest text-black"
            >
              LYRA
            </Link>
            <p className="mb-6 pr-4 text-xs leading-relaxed text-gray-500">
              Curating a world of thoughtful design and enduring quality for the modern wardrobe.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a
                href="https://instagram.com/lyrafashion"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="transition-colors hover:text-black"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
              <a
                href="https://facebook.com/lyrafashion"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="transition-colors hover:text-black"
              >
                <Facebook className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="mb-6 text-xs font-semibold tracking-widest uppercase">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <Link href="/products" className="transition-colors hover:text-black">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-black">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-black">
                  Bestsellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h4 className="mb-6 text-xs font-semibold tracking-widest uppercase">Information</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <Link href="/shipping-returns" className="transition-colors hover:text-black">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="transition-colors hover:text-black">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="transition-colors hover:text-black">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* About Us Links */}
          <div>
            <h4 className="mb-6 text-xs font-semibold tracking-widest uppercase">About Us</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <Link href="/about" className="transition-colors hover:text-black">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/factory-story" className="transition-colors hover:text-black">
                  Atelier
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-black">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between border-t border-gray-300 pt-8 text-xs text-gray-400 md:flex-row">
          <p>&copy; {new Date().getFullYear()} LYRA. All rights reserved.</p>
          <div className="mt-4 flex space-x-4 md:mt-0">
            <Link href="/terms-of-service" className="transition-colors hover:text-gray-600">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-gray-600">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
