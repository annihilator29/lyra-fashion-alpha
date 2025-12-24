import { renderHook, act } from '@testing-library/react';
import { useCheckout } from './use-checkout';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('useCheckout Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset sessionStorage mock
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it('initializes with shipping step and empty checkout data', () => {
    const { result } = renderHook(() => useCheckout());

    expect(result.current.currentStep).toBe('shipping');
    expect(result.current.checkoutData).toEqual({});
  });

  it('navigates to next step correctly', () => {
    const { result } = renderHook(() => useCheckout());

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe('review');
  });

  it('navigates to previous step correctly', () => {
    const { result } = renderHook(() => useCheckout());

    // First go to review step
    act(() => {
      result.current.goToStep('review');
    });

    // Then go back
    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStep).toBe('shipping');
  });

  it('updates checkout data correctly', () => {
    const { result } = renderHook(() => useCheckout());

    const testData = { 
      email: 'test@example.com', 
      shipping_name: 'John Doe' 
    };

    act(() => {
      result.current.updateCheckoutData(testData);
    });

    expect(result.current.checkoutData).toEqual(testData);
  });

  it('saves data to session storage', () => {
    const { result } = renderHook(() => useCheckout());

    const testData = { 
      email: 'test@example.com', 
      shipping_name: 'John Doe' 
    };

    act(() => {
      result.current.updateCheckoutData(testData);
    });

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'checkout-data', 
      JSON.stringify(testData)
    );
  });

  it('loads data from session storage on mount', () => {
    const savedData = { email: 'test@example.com', shipping_name: 'John Doe' };
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedData));

    const { result } = renderHook(() => useCheckout());

    expect(result.current.checkoutData).toEqual(savedData);
  });

  it('clears checkout data', () => {
    const { result } = renderHook(() => useCheckout());

    // Add some data first
    const testData = { email: 'test@example.com' };
    act(() => {
      result.current.updateCheckoutData(testData);
    });

    // Then clear it
    act(() => {
      result.current.clearCheckoutData();
    });

    expect(result.current.checkoutData).toEqual({});
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('checkout-data');
  });
});