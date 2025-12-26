import { createPaymentIntent } from '../create-payment-intent';
import { createClient } from '@supabase/supabase-js';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: 'pi_123',
          client_secret: 'pi_123_client_secret_456',
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'pi_123',
          client_secret: 'pi_123_client_secret_456',
        }),
        cancel: jest.fn(),
      },
    };
  });
});

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockFrom = jest.fn();
  return {
    createClient: jest.fn().mockReturnValue({
      from: mockFrom,
    }),
  };
});

// Mock crypto
jest.mock('crypto', () => ({
  randomUUID: () => 'mocked-uuid',
}));

// Helper to setup supabase mock chains
const setupSupabaseMocks = (
  existingOrder: unknown = null,
  newOrder: unknown = { id: 'order_123', order_number: 'LF-TEST-1234' }
) => {
  const mockedCreateClient = jest.mocked(createClient);
  const mockFrom = jest.fn();
  
  // First call: check for existing order
  mockFrom.mockReturnValueOnce({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: existingOrder, error: existingOrder ? null : { code: 'PGRST116' } }),
  });
  
  // Second call: insert new order
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: newOrder, error: null }),
  });
  
  // Third call: insert order items
  mockFrom.mockReturnValueOnce({
    insert: jest.fn().mockResolvedValue({ error: null }),
  });
  
  mockedCreateClient.mockReturnValue({ from: mockFrom } as unknown as ReturnType<typeof createClient>);
  
  return mockFrom;
};

describe('createPaymentIntent', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
    jest.clearAllMocks();
  });

  it('should create a payment intent successfully', async () => {
    setupSupabaseMocks();

    const result = await createPaymentIntent({
      amount: 2000,
      currency: 'usd',
      cart_items: [
        { id: 'item-1', price: 2000, quantity: 1 }
      ]
    });

    expect(result.data).toBeDefined();
    expect(result.data?.clientSecret).toBe('pi_123_client_secret_456');
    expect(result.data?.orderId).toBeDefined();
    expect(result.data?.orderNumber).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should return error for invalid amount', async () => {
    const result = await createPaymentIntent({
      amount: -100, // invalid amount
    });

    expect(result).toEqual({
      error: {
        message: 'Invalid amount provided. Amount must be a positive number in cents.'
      }
    });
  });

  it('should return existing payment intent if idempotency key exists', async () => {
    const existingOrder = { 
      id: 'order_123', 
      stripe_payment_intent_id: 'pi_123',
      total: 2000,
      order_number: 'LF-EXISTING-1234',
    };
    
    setupSupabaseMocks(existingOrder);

    const result = await createPaymentIntent({
      amount: 2000,
      idempotency_key: 'existing-key',
    });

    expect(result.data).toBeDefined();
    expect(result.data?.clientSecret).toBe('pi_123_client_secret_456');
    expect(result.data?.orderId).toBe('order_123');
    expect(result.data?.orderNumber).toBe('LF-EXISTING-1234');
  });

  it('should return error for amount mismatch with existing order', async () => {
    const existingOrder = { 
      id: 'order_123', 
      stripe_payment_intent_id: 'pi_123',
      total: 1500, // different from new amount
      order_number: 'LF-TEST-1234',
    };
    
    setupSupabaseMocks(existingOrder);

    const result = await createPaymentIntent({
      amount: 2000, // different from existing total
      idempotency_key: 'existing-key',
    });

    expect(result).toEqual({
      error: {
        message: 'Amount mismatch for existing idempotency key. This may indicate a security issue.'
      }
    });
  });
});