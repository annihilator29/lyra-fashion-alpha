import { useState, useEffect } from 'react';

type CheckoutStep = 'shipping' | 'payment' | 'review';

interface CheckoutData {
  email?: string;
  phone?: string;
  shipping_name?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  same_as_shipping?: boolean;
  billing_name?: string;
  billing_address?: string;
  billing_city?: string;
  billing_postal_code?: string;
  billing_country?: string;
  // Payment state persistence
  paymentClientSecret?: string;
  paymentOrderId?: string;
  paymentAmount?: number;
}

/**
 * Checkout management hook for handling multi-step checkout flow.
 * Manages checkout data state, step navigation, and session storage persistence.
 *
 * @returns Checkout state and actions object
 *
 * @example
 * ```typescript
 * const {
 *   currentStep,
 *   nextStep,
 *   checkoutData,
 *   updateCheckoutData,
 *   clearCheckoutData
 * } = useCheckout();
 *
 * // Navigate through checkout steps
 * if (currentStep === 'shipping') {
 *   nextStep(); // shipping → review
 * }
 * updateCheckoutData({ email: 'user@example.com' });
 * ```
 */

// Helper function to check if there's actual checkout data
const hasCheckoutData = (data: CheckoutData): boolean => {
  return Object.values(data).some(value => value !== undefined && value !== '');
};

export const useCheckout = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});

  // Load checkout data from session storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('checkout-data');
    if (savedData) {
      setCheckoutData(JSON.parse(savedData));
    }
  }, []);

  // Save checkout data to session storage whenever it changes
  useEffect(() => {
    if (hasCheckoutData(checkoutData)) {
      sessionStorage.setItem('checkout-data', JSON.stringify(checkoutData));
    }
  }, [checkoutData]);

  // Handle browser back button confirmation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasCheckoutData(checkoutData)) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Do you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [checkoutData]);

  const nextStep = () => {
    if (currentStep === 'shipping') {
      setCurrentStep('review'); // Shipping -> Review
    } else if (currentStep === 'review') {
      setCurrentStep('payment'); // Review -> Payment
    } else if (currentStep === 'payment') {
      // Payment is the final step
    }
  };

  const prevStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('review'); // Payment -> Review
    } else if (currentStep === 'review') {
      setCurrentStep('shipping'); // Review -> Shipping
    }
  };

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const updateCheckoutData = (data: CheckoutData) => {
    setCheckoutData(prev => ({ ...prev, ...data }));
  };

  const clearCheckoutData = () => {
    setCheckoutData({});
    sessionStorage.removeItem('checkout-data');
  };

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    checkoutData,
    updateCheckoutData,
    clearCheckoutData,
  };
};