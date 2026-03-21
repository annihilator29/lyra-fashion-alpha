import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Returns - Lyra Fashion',
  description:
    'Learn about Lyra Fashion shipping options, delivery times, and our hassle-free return policy.',
};

export default function ShippingReturnsPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping & Returns</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about getting your order and our return policy.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Shipping</h2>
            <div className="space-y-4 text-[#3A3531]/80 leading-relaxed">
              <div>
                <h3 className="font-semibold text-[#3A3531]">Standard Shipping</h3>
                <p>5-7 business days. Free on orders over $75.</p>
              </div>
              <div>
                <h3 className="font-semibold text-[#3A3531]">Express Shipping</h3>
                <p>2-3 business days. $12.99 flat rate.</p>
              </div>
              <div>
                <h3 className="font-semibold text-[#3A3531]">International Shipping</h3>
                <p>7-14 business days. Rates calculated at checkout.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Returns</h2>
            <div className="space-y-4 text-[#3A3531]/80 leading-relaxed">
              <p>
                We want you to love your purchase. If something does not work out, you have 30 days from
                delivery to return unworn items with tags attached.
              </p>
              <div>
                <h3 className="font-semibold text-[#3A3531]">How to Return</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Log in to your account and go to Orders</li>
                  <li>Select the order and click Request Return</li>
                  <li>Print the prepaid shipping label</li>
                  <li>Pack the item and drop it off</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-[#3A3531]">Refund Timeline</h3>
                <p>
                  Refunds are processed within 5-7 business days after we receive your return. The refund
                  will be issued to your original payment method.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Exchanges</h2>
            <p className="text-[#3A3531]/80 leading-relaxed">
              Need a different size or color? Start a return and place a new order. We will process your
              refund as soon as we receive the original item.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
