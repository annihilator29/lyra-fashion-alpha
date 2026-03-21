import { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact Us - Lyra Fashion',
  description:
    'Get in touch with Lyra Fashion. We are here to help with orders, returns, sizing, and any questions.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Have a question or need help? We would love to hear from you.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[#3A3531]">Get in Touch</h2>
            <ContactForm />
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#3A3531]">Email</h3>
              <p className="text-[#3A3531]/80">support@lyrafashion.com</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#3A3531]">Response Time</h3>
              <p className="text-[#3A3531]/80">
                We aim to respond within 24 hours on business days.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#3A3531]">Business Hours</h3>
              <p className="text-[#3A3531]/80">
                Monday - Friday: 9:00 AM - 6:00 PM (EST)
                <br />
                Saturday - Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
