import { POST } from '../route';
import { NextRequest } from 'next/server';

// Simplified mock approach to avoid TypeScript issues with Stripe constructor
const mockConstructEvent = jest.fn();
const mockSupabaseFrom = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }));
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    from: mockSupabaseFrom,
  })),
}));

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_key';
  });

  const createMockRequest = (body: string, signature: string | null = 'test_signature'): NextRequest => {
    return {
      text: jest.fn().mockResolvedValue(body),
      headers: {
        get: (name: string) => name === 'stripe-signature' ? signature : null,
      },
    } as unknown as NextRequest;
  };

  it('should return 400 if stripe signature is missing', async () => {
    const request = createMockRequest('{}', null);
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe('Missing stripe signature');
  });

  it('should return 400 if webhook signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });
    
    const request = createMockRequest('{}', 'invalid_signature');
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('should return 200 if event was already processed (idempotency)', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_already_processed',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    });
    
    // Mock existing event in processed_webhooks
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'existing_event' },
        error: null,
      }),
    });
    
    const request = createMockRequest('{}', 'test_signature');
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
  });

  it('should handle payment_intent.succeeded event and update order status', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_payment_succeeded',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    });
    
    let callCount = 0;
    mockSupabaseFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: check processed_webhooks
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        };
      } else if (callCount === 2) {
        // Second call: orders lookup
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'order_123', status: 'pending' }, error: null }),
        };
      } else if (callCount === 3) {
        // Third call: orders update
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: null }),
        };
      } else {
        // Fourth call: insert processed_webhooks
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
    });
    
    const request = createMockRequest('{}', 'test_signature');
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
  });

  it('should handle payment_intent.payment_failed event', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_payment_failed',
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_123' } },
    });
    
    let callCount = 0;
    mockSupabaseFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        };
      } else if (callCount === 2) {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'order_123', status: 'pending' }, error: null }),
        };
      } else if (callCount === 3) {
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: null }),
        };
      } else {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
    });
    
    const request = createMockRequest('{}', 'test_signature');
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
  });

  it('should handle duplicate webhook delivery gracefully', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_duplicate',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    });
    
    // Event already processed
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'evt_duplicate', event_id: 'evt_duplicate' },
        error: null,
      }),
    });
    
    const request = createMockRequest('{}', 'test_signature');
    
    const response = await POST(request);
    
    // Should return 200 without reprocessing (idempotent)
    expect(response.status).toBe(200);
  });
});
