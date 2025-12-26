'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useCheckout } from '@/hooks/use-checkout';
import CheckoutShippingForm from '@/components/shop/checkout-shipping-form';
import CheckoutOrderSummary from '@/components/shop/checkout-order-summary';
import CheckoutPaymentForm from '@/components/shop/checkout-payment-step';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Define checkout steps
type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutClient() {
  const { items } = useCartStore();
  const { currentStep, nextStep, prevStep, goToStep, checkoutData, updateCheckoutData } = useCheckout();
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  // Check if cart has items
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart'); // Actual redirect to cart
    }
  }, [items, router]);

  // Check screen size for mobile layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle form submission from shipping step
  const handleShippingSubmit = (data: Record<string, unknown>) => {
    updateCheckoutData(data);
    nextStep();
  };

  // Classy progress indicator component with elegant circles and progress bar
  const ProgressIndicator = () => {
    const steps: CheckoutStep[] = ['shipping', 'review', 'payment'];
    const stepLabels = {
      shipping: 'Shipping',
      review: 'Review',
      payment: 'Payment',
    };
    
    const currentStepIndex = steps.indexOf(currentStep);

    return (
      <div className="mb-6">
        {/* Progress bar container */}
        <div className="relative mb-4">
          {/* Background track */}
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            {/* Progress fill using cost bar colors */}
            <div
              className="h-full bg-gradient-to-r from-[#5D6D5B] via-[#8B9D89] to-[#B8C5B6] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          
          {/* Step circles positioned on top of progress bar */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-between">
            {steps.map((step, index) => (
              <div key={step} className="relative">
                {/* Outer glow for active step */}
                {currentStep === step && (
                  <div className="absolute inset-0 rounded-full bg-[#8B9D89]/20 blur-md animate-pulse" />
                )}
                
                {/* Step circle */}
                <div
                  className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ease-out ${
                    currentStepIndex >= index
                      ? 'bg-white border-2 border-[#5D6D5B] shadow-lg'
                      : 'bg-white border-2 border-gray-300'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Inner dot */}
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                      currentStepIndex >= index
                        ? 'bg-[#5D6D5B]'
                        : 'bg-gray-300'
                    }`}
                  />
                  
                  {/* Active step inner glow */}
                  {currentStep === step && (
                    <div className="absolute inset-0 rounded-full bg-[#5D6D5B]/20 blur-sm" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step labels */}
        <div className="flex justify-between px-1">
          {steps.map((step) => (
            <div
              key={step}
              className={`text-center transition-all duration-300 cursor-pointer ${
                currentStep === step ? 'transform -translate-y-1' : ''
              }`}
            >
              <div
                className={`text-xs font-medium tracking-wide uppercase transition-all duration-300 ${
                  currentStep === step
                    ? 'text-[#5D6D5B] font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {stepLabels[step]}
              </div>
              
              {/* Active indicator dot */}
              {currentStep === step && (
                <div className="w-1 h-1 bg-[#5D6D5B] rounded-full mx-auto mt-1" />
              )}
            </div>
          ))}
        </div>
        
        {/* Current step title */}
        <div className="text-center mt-4">
          <h2 className="text-lg font-light text-gray-800 capitalize tracking-tight">
            {currentStep === 'shipping' && 'Shipping Information'}
            {currentStep === 'payment' && 'Payment Information'}
            {currentStep === 'review' && 'Review Order'}
          </h2>
        </div>
      </div>
    );
  };

  // Navigation buttons
  const NavigationButtons = () => {
    return (
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 'shipping'}
        >
          Back
        </Button>
        {currentStep === 'review' && (
          <Button onClick={() => goToStep('payment')}>
            Continue to Payment
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <ProgressIndicator />
      
      <div className={`${isMobile ? 'flex-col' : 'flex gap-8'}`}>
        {/* Form Section */}
        <div className={`${isMobile ? 'order-1 mb-8' : 'w-1/2'}`}>
          {currentStep === 'shipping' && (
            <CheckoutShippingForm 
              onNext={handleShippingSubmit} 
              formData={checkoutData} 
            />
          )}
          
          {currentStep === 'payment' && (
            <CheckoutPaymentForm
              checkoutData={{
                items: items.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.imageUrl,
                })),
                shippingAddress: {
                  name: checkoutData?.shipping_name,
                  line1: checkoutData?.shipping_address,
                  city: checkoutData?.shipping_city,
                  postal_code: checkoutData?.shipping_postal_code,
                  country: checkoutData?.shipping_country,
                  email: checkoutData?.email,
                },
                billingAddress: checkoutData?.same_as_shipping ? {
                  name: checkoutData?.shipping_name,
                  line1: checkoutData?.shipping_address,
                  city: checkoutData?.shipping_city,
                  postal_code: checkoutData?.shipping_postal_code,
                  country: checkoutData?.shipping_country,
                  email: checkoutData?.email,
                } : {
                  name: checkoutData?.billing_name,
                  line1: checkoutData?.billing_address,
                  city: checkoutData?.billing_city,
                  postal_code: checkoutData?.billing_postal_code,
                  country: checkoutData?.billing_country,
                  email: checkoutData?.email,
                },
                subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                shipping: 0, // Free shipping for now
                tax: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08, // 8% tax
                total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.08,
              }}
              onPaymentSuccess={(orderId: string) => {
                toast.success('Payment successful! Order ID: ' + orderId);
                // Clear cart after successful payment
                useCartStore.getState().clearCart();
                router.push('/checkout/success?order=' + orderId);
              }}
              onBack={() => prevStep()}
            />
          )}
          
          {currentStep === 'review' && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Review Your Order</h3>
              
               {/* Shipping Address Section */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Shipping Address:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToStep('shipping')}
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-gray-700">
                  {checkoutData?.shipping_name}<br />
                  {checkoutData?.shipping_address}<br />
                  {checkoutData?.shipping_city}, {checkoutData?.shipping_postal_code}<br />
                  {checkoutData?.shipping_country}
                </p>
              </div>

              {/* Billing Address Section */}
              {!checkoutData?.same_as_shipping && checkoutData?.billing_name && (
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Billing Address:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToStep('shipping')}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700">
                    {checkoutData?.billing_name}<br />
                    {checkoutData?.billing_address}<br />
                    {checkoutData?.billing_city}, {checkoutData?.billing_postal_code}<br />
                    {checkoutData?.billing_country}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {currentStep !== 'shipping' && <NavigationButtons />}
        </div>
        
        {/* Order Summary Section */}
        <div className={cn(
          isMobile ? 'order-2' : 'w-1/2 sticky top-4'
        )}>
          <CheckoutOrderSummary />
        </div>
      </div>
    </div>
  );
}