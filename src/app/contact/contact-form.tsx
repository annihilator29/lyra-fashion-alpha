'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Form submission logic would go here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent</h3>
        <p className="text-green-700">
          Thank you for reaching out. We will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#3A3531] mb-1">
          Name
        </label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#3A3531] mb-1">
          Email
        </label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-[#3A3531] mb-1">
          Subject
        </label>
        <Input id="subject" name="subject" required placeholder="How can we help?" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#3A3531] mb-1">
          Message
        </label>
        <Textarea id="message" name="message" required placeholder="Tell us more..." rows={5} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#4A5F4B] hover:bg-[#7A9B7C] text-white"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
