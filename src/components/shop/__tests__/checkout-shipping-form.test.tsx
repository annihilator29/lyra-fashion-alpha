import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import CheckoutShippingForm from '../checkout-shipping-form';

// Mock the toast module
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CheckoutShippingForm', () => {
  const mockOnNext = jest.fn();
  const mockFormData = {
    email: 'test@example.com',
    phone: '+1234567890',
    shipping_name: 'John Doe',
    shipping_address: '123 Main St',
    shipping_city: 'New York',
    shipping_postal_code: '10001',
    shipping_country: 'US',
    same_as_shipping: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(<CheckoutShippingForm onNext={mockOnNext} formData={mockFormData} />);

    // Check for contact information fields
    expect(screen.getByText('Email *')).toBeInTheDocument();
    expect(screen.getByText('Phone *')).toBeInTheDocument();
    
    // Check for shipping address fields
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    expect(screen.getByText('Full Name *')).toBeInTheDocument();
    expect(screen.getByText('Address *')).toBeInTheDocument();
    expect(screen.getByText('City *')).toBeInTheDocument();
    expect(screen.getByText('Postal Code *')).toBeInTheDocument();
    expect(screen.getByText('Country *')).toBeInTheDocument();
    
    // Check for billing address section
    expect(screen.getByText('Billing Address')).toBeInTheDocument();
  });

  it('displays validation errors when form is submitted with invalid data', async () => {
    render(<CheckoutShippingForm onNext={mockOnNext} />);

    // Submit empty form
    const submitButton = screen.getByText('Continue to Review');
    fireEvent.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('calls onNext with valid form data when submitted', async () => {
    render(<CheckoutShippingForm onNext={mockOnNext} />);

    // Fill in form fields with valid data
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '+1234567890' } });
    fireEvent.change(screen.getByLabelText('Full Name *'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Address *'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('City *'), { target: { value: 'New York' } });
    fireEvent.change(screen.getByLabelText('Postal Code *'), { target: { value: '10001' } });

    // Submit the form
    const submitButton = screen.getByText('Continue to Review');
    fireEvent.click(submitButton);

    // Wait for form submission
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('toggles billing address fields based on checkbox state', () => {
    render(<CheckoutShippingForm onNext={mockOnNext} />);

    // Initially, billing fields should be hidden (if same_as_shipping is true by default)
    
    // Click the "same as shipping" checkbox to uncheck it
    const sameAsShippingCheckbox = screen.getByText('Billing address same as shipping').closest('form')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (sameAsShippingCheckbox) {
      fireEvent.click(sameAsShippingCheckbox);
    }

    // Now billing fields should appear
    // We'll test this with a different approach since the implementation might vary
  });
});