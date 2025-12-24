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
}

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
      setCurrentStep('review'); // Skip payment for now (will be implemented in Story 3.3)
    } else if (currentStep === 'review') {
      // Stay on review step
    }
  };

  const prevStep = () => {
    if (currentStep === 'review') {
      setCurrentStep('shipping'); // Go back to shipping from review
    } else if (currentStep === 'payment') {
      setCurrentStep('shipping');
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