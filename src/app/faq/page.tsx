'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'How do I track my order?',
    answer:
      'Once your order ships, you will receive an email with a tracking number. You can also track your order by logging into your account and visiting the Orders page.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. All transactions are securely processed.',
  },
  {
    question: 'How do I find my size?',
    answer:
      'Each product page includes a detailed size guide with measurements. We recommend measuring yourself and comparing to the size chart for the best fit.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer:
      'Orders can be modified or cancelled within 1 hour of placing them. After that, the order enters processing and cannot be changed. Please contact support immediately if you need to make changes.',
  },
  {
    question: 'Do you offer gift cards?',
    answer:
      'Yes! Gift cards are available in various denominations and never expire. They can be purchased on our website and delivered via email.',
  },
  {
    question: 'How should I care for my garments?',
    answer:
      'Care instructions are included on the label of each garment. Generally, we recommend washing in cold water, tumble drying on low, and storing in a cool, dry place.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes, we ship to most countries worldwide. International shipping rates and delivery times are calculated at checkout based on your location.',
  },
  {
    question: 'What if my item arrives damaged?',
    answer:
      'If your item arrives damaged or defective, please contact us within 48 hours with photos of the issue. We will arrange a replacement or full refund at no cost to you.',
  },
];

function FaqAccordion({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-semibold text-[#3A3531]">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-[#3A3531]/80 leading-relaxed">{item.answer}</div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqAccordion key={index} item={faq} />
          ))}
        </div>
      </section>
    </main>
  );
}
