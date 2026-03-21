import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Lyra Fashion',
  description: 'Lyra Fashion terms of service — the terms and conditions governing use of our website and services.',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Last updated: January 1, 2026
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-8 text-[#3A3531]/80 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Acceptance of Terms</h2>
            <p>
              By accessing and using the Lyra Fashion website, you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Use of Website</h2>
            <p>
              You agree to use our website only for lawful purposes and in a way that does not infringe
              upon the rights of others. You may not use our website to transmit harmful content, attempt
              unauthorized access, or interfere with site functionality.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Products and Orders</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>All product descriptions and images are as accurate as possible</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to refuse or cancel any order</li>
              <li>Availability of products is not guaranteed</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, and designs, is the property of
              Lyra Fashion and is protected by intellectual property laws. You may not reproduce,
              distribute, or modify any content without our written permission.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Limitation of Liability</h2>
            <p>
              Lyra Fashion shall not be liable for any indirect, incidental, or consequential damages
              arising from your use of our website or products. Our total liability shall not exceed the
              amount paid for the product in question.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Governing Law</h2>
            <p>
              These terms are governed by the laws of the United States. Any disputes shall be resolved
              in the courts of the state where Lyra Fashion is incorporated.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective upon
              posting to this page. Continued use of the website constitutes acceptance of updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Contact Us</h2>
            <p>
              If you have questions about these terms, please contact us at{' '}
              <a href="mailto:legal@lyrafashion.com" className="underline hover:text-[#3A3531]">
                legal@lyrafashion.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
