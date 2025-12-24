'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutShippingSchema } from '@/lib/validations/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';
import type { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Define the type from our schema
type CheckoutShippingFormData = z.infer<typeof checkoutShippingSchema>;

interface CheckoutShippingFormProps {
  onNext: (data: CheckoutShippingFormData) => void;
  formData?: Partial<CheckoutShippingFormData>;
}

export default function CheckoutShippingForm({
  onNext,
  formData = {},
}: CheckoutShippingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutShippingFormData>({
    resolver: zodResolver(checkoutShippingSchema),
    defaultValues: {
      email: formData.email || '',
      phone: formData.phone || '',
      shipping_name: formData.shipping_name || '',
      shipping_address: formData.shipping_address || '',
      shipping_city: formData.shipping_city || '',
      shipping_postal_code: formData.shipping_postal_code || '',
      shipping_country: formData.shipping_country || 'US',
      same_as_shipping: formData.same_as_shipping || true,
      billing_name: formData.billing_name || '',
      billing_address: formData.billing_address || '',
      billing_city: formData.billing_city || '',
      billing_postal_code: formData.billing_postal_code || '',
      billing_country: formData.billing_country || 'US',
    },
  });

  // Watch the "same as shipping" checkbox to conditionally show billing fields
  const sameAsShipping = form.watch('same_as_shipping');

  const onSubmit = async (data: CheckoutShippingFormData) => {
    setIsSubmitting(true);
    
    // In a real app, you might validate with an API here
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the onNext function with the form data
      onNext(data);
      
      toast.success('Shipping information saved', {
        description: 'Proceeding to review',
      });
    } catch (error) {
      console.error('Error saving shipping info:', error);
      toast.error('Failed to save shipping information', {
        description: 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="your.email@example.com" 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel"
                    placeholder="+1 (555) 123-4567" 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipping Address</h3>
          
          <FormField
            control={form.control}
            name="shipping_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="John Doe" 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shipping_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="123 Main Street" 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="shipping_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="New York" 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipping_postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="10001" 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="shipping_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <select
                  className="w-full p-2 border border-input rounded-md bg-background"
                  {...field}
                  disabled={isSubmitting}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Billing Address</h3>
          
          <FormField
            control={form.control}
            name="same_as_shipping"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Billing address same as shipping
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {!sameAsShipping && (
            <div className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="billing_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="John Doe" 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="123 Main Street" 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="billing_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="New York" 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billing_postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="10001" 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="billing_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <select
                      className="w-full p-2 border border-input rounded-md bg-background"
                      {...field}
                      disabled={isSubmitting}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Continue to Review'}
        </Button>
      </form>
    </Form>
  );
}