/**
 * Generate Return Label API Tests
 * Story 6.4: Returns & Refunds Processing - Task 9.5
 * 
 * Tests for return label generation API endpoint
 */

import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Mock environment variables
process.env.SHIPPO_API_KEY = 'shippo_test_key';
process.env.WAREHOUSE_NAME = 'Lyra Fashion Returns';
process.env.WAREHOUSE_STREET = '123 Return St';
process.env.WAREHOUSE_CITY = 'New York';
process.env.WAREHOUSE_STATE = 'NY';
process.env.WAREHOUSE_ZIP = '10001';
process.env.WAREHOUSE_COUNTRY = 'US';

// Mock Supabase server client
const mockSupabaseFrom = jest.fn();
const mockSupabaseAuth = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockSupabaseAuth,
    },
    from: mockSupabaseFrom,
  })),
}));

// Mock fetch for Shippo API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Generate Return Label API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (method: string, body?: object): NextRequest => {
    return {
      method,
      json: jest.fn().mockResolvedValue(body || {}),
    } as unknown as NextRequest;
  };

  describe('POST /api/returns/[id]/generate-label', () => {
    it('returns 401 if user is not authenticated', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = createMockRequest('POST');
      const response = await POST(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 403 if user is not an admin', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'customer' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const request = createMockRequest('POST');
      const response = await POST(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('returns 503 if Shippo API key is not configured', async () => {
      // Temporarily remove the API key
      const originalKey = process.env.SHIPPO_API_KEY;
      delete process.env.SHIPPO_API_KEY;

      const request = createMockRequest('POST');
      const response = await POST(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toBe('Shipping service not configured. Contact support.');

      // Restore the API key
      process.env.SHIPPO_API_KEY = originalKey;
    });

    it('returns 404 if return not found', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null,
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'returns') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { message: 'Not found' },
                })),
              })),
            })),
          };
        }
        return {};
      });

      const request = createMockRequest('POST');
      const response = await POST(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Return not found');
    });

    it('returns 400 if label already exists', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null,
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'returns') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'return-123',
                    shipping_label_url: 'https://example.com/existing-label.pdf',
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const request = createMockRequest('POST');
      const response = await POST(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Label already generated for this return');
    });

    it('generates label successfully', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null,
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'returns') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'return-123',
                    rma_number: 'RMA-123-20250202',
                    order_id: 'order-123',
                    shipping_label_url: null,
                    order: {
                      shipping_address: {
                        name: 'Test User',
                        address_line1: '456 Customer St',
                        city: 'Los Angeles',
                        state: 'CA',
                        postal_code: '90210',
                        country: 'US',
                      },
                      customer_email: 'customer@example.com',
                    },
                  },
                  error: null,
                })),
              })),
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
        return {};
      });

      // Mock Shippo API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            object_id: 'shipment_123',
            rates: [
              {
                object_id: 'rate_123',
                amount: '10.50',
                currency: 'USD',
                provider: 'USPS',
                servicelevel: { name: 'Priority Mail' },
              },
              {
                object_id: 'rate_456',
                amount: '8.25',
                currency: 'USD',
                provider: 'UPS',
                servicelevel: { name: 'Ground' },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            object_id: 'transaction_123',
            label_url: 'https://shippo.com/label.pdf',
            tracking_number: '1Z999AA10123456784',
            tracking_url_provider: 'https://track.example.com/1Z999AA10123456784',
          }),
        });

      const request = createMockRequest('POST');
      const response = await POST(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.label_url).toBe('https://shippo.com/label.pdf');
      expect(data.tracking_number).toBe('1Z999AA10123456784');
      expect(data.cost).toBe('8.25'); // Cheapest rate selected
    });

    it('handles Shippo API errors gracefully', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null,
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'returns') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'return-123',
                    rma_number: 'RMA-123-20250202',
                    order_id: 'order-123',
                    shipping_label_url: null,
                    order: {
                      shipping_address: {
                        name: 'Test User',
                        address_line1: '456 Customer St',
                        city: 'Los Angeles',
                        state: 'CA',
                        postal_code: '90210',
                        country: 'US',
                      },
                      customer_email: 'customer@example.com',
                    },
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      // Mock Shippo API failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: 'Invalid address',
        }),
      });

      const request = createMockRequest('POST');
      const response = await POST(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to create shipment');
    });
  });

  describe('GET /api/returns/[id]/generate-label', () => {
    it('returns label information for authorized user', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'customer' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'returns') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'return-123',
                    shipping_label_url: 'https://example.com/label.pdf',
                    tracking_number: 'TRACK123',
                    tracking_url: 'https://track.example.com/123',
                    order: {
                      customer_id: 'user-123', // Same as authenticated user
                    },
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const request = createMockRequest('GET');
      const response = await GET(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.label_url).toBe('https://example.com/label.pdf');
      expect(data.tracking_number).toBe('TRACK123');
    });

    it('allows admins to access any return label', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null,
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'returns') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'return-123',
                    shipping_label_url: 'https://example.com/label.pdf',
                    tracking_number: 'TRACK123',
                    order: {
                      customer_id: 'other-user-123', // Different from authenticated user
                    },
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const request = createMockRequest('GET');
      const response = await GET(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(200);
    });

    it('returns 403 if user is not owner or admin', async () => {
      mockSupabaseAuth.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'customer' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'returns') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'return-123',
                    order: {
                      customer_id: 'different-user-456', // Different user
                    },
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const request = createMockRequest('GET');
      const response = await GET(request, { params: Promise.resolve({ id: 'return-123' }) });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });
});
