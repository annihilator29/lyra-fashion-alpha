import { checkoutShippingSchema } from './checkout';

describe('Checkout Validation Schema', () => {
  it('validates correct shipping data', () => {
    const validData = {
      email: 'test@example.com',
      phone: '+1234567890',
      shipping_name: 'John Doe',
      shipping_address: '123 Main St',
      shipping_city: 'New York',
      shipping_postal_code: '10001',
      shipping_country: 'US',
      same_as_shipping: true,
    };

    const result = checkoutShippingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails validation for invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      phone: '+1234567890',
      shipping_name: 'John Doe',
      shipping_address: '123 Main St',
      shipping_city: 'New York',
      shipping_postal_code: '10001',
      shipping_country: 'US',
      same_as_shipping: true,
    };

    const result = checkoutShippingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('email');
    }
  });

  it('fails validation for short name', () => {
    const invalidData = {
      email: 'test@example.com',
      phone: '+1234567890',
      shipping_name: 'A', // Too short
      shipping_address: '123 Main St',
      shipping_city: 'New York',
      shipping_postal_code: '10001',
      shipping_country: 'US',
      same_as_shipping: true,
    };

    const result = checkoutShippingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 2 characters');
    }
  });

  it('fails validation for invalid phone number', () => {
    const invalidData = {
      email: 'test@example.com',
      phone: '123', // Too short
      shipping_name: 'John Doe',
      shipping_address: '123 Main St',
      shipping_city: 'New York',
      shipping_postal_code: '10001',
      shipping_country: 'US',
      same_as_shipping: true,
    };

    const result = checkoutShippingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('too short');
    }
  });

  it('requires billing fields when same_as_shipping is false', () => {
    const invalidData = {
      email: 'test@example.com',
      phone: '+1234567890',
      shipping_name: 'John Doe',
      shipping_address: '123 Main St',
      shipping_city: 'New York',
      shipping_postal_code: '10001',
      shipping_country: 'US',
      same_as_shipping: false, // Different billing address required
      // Missing billing fields
    };

    const result = checkoutShippingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Billing address is required');
    }
  });

  it('validates supported countries correctly', () => {
    const validData = {
      email: 'test@example.com',
      phone: '+1234567890',
      shipping_name: 'John Doe',
      shipping_address: '123 Main St',
      shipping_city: 'New York',
      shipping_postal_code: '10001',
      shipping_country: 'CA', // Valid country
      same_as_shipping: true,
    };

    const result = checkoutShippingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails validation for unsupported country', () => {
    const invalidData = {
      email: 'test@example.com',
      phone: '+1234567890',
      shipping_name: 'John Doe',
      shipping_address: '123 Main St',
      shipping_city: 'New York',
      shipping_postal_code: '10001',
      shipping_country: 'XX', // Invalid country
      same_as_shipping: true,
    };

    const result = checkoutShippingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Country not supported');
    }
  });
});