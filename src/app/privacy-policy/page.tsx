import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Lyra Fashion',
  description: 'Lyra Fashion privacy policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Last updated: January 1, 2026
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-8 text-[#3A3531]/80 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Information We Collect</h2>
            <p>
              We collect information you provide directly, such as when you create an account, place an
              order, subscribe to our newsletter, or contact us. This may include your name, email address,
              shipping address, phone number, and payment information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your questions and support requests</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Information Sharing</h2>
            <p>
              We do not sell your personal information. We share data only with trusted service providers
              who help us operate our business, such as payment processors, shipping carriers, and email
              service providers. All partners are contractually obligated to protect your data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information, including
              encryption, secure servers, and regular security audits. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information at any time. You
              can manage your account settings or contact us to exercise these rights. You may also opt out
              of marketing communications at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize
              content. You can manage cookie preferences through your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:privacy@lyrafashion.com" className="underline hover:text-[#3A3531]">
                privacy@lyrafashion.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
