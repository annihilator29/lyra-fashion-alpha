import { generateReviewToken, verifyReviewToken, isTokenValid } from '../tokens';

// Mock environment variables
const mockSecret = 'test-secret-key-for-review-tokens';

Object.defineProperty(process, 'env', {
  value: {
    REVIEW_TOKEN_SECRET: mockSecret,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: mockSecret,
  },
  writable: true,
});

describe('generateReviewToken', () => {
  it('should create a valid token', async () => {
    const token = await generateReviewToken(
      'order-123',
      'product-456',
      'customer-789',
      'test@example.com'
    );

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
  });

  it('should create unique tokens for different calls', async () => {
    const token1 = await generateReviewToken(
      'order-123',
      'product-456',
      'customer-789',
      'test@example.com'
    );
    const token2 = await generateReviewToken(
      'order-123',
      'product-456',
      'customer-789',
      'test@example.com'
    );

    // Tokens should be different due to different timestamps
    expect(token1).not.toBe(token2);
  });

  it('should create tokens with correct payload structure', async () => {
    const token = await generateReviewToken(
      'order-123',
      'product-456',
      'customer-789',
      'test@example.com'
    );

    const payload = await verifyReviewToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.orderId).toBe('order-123');
    expect(payload?.productId).toBe('product-456');
    expect(payload?.customerId).toBe('customer-789');
    expect(payload?.email).toBe('test@example.com');
    expect(payload?.iat).toBeDefined();
    expect(payload?.exp).toBeDefined();
  });
});

describe('verifyReviewToken', () => {
  it('should validate correct token', async () => {
    const token = await generateReviewToken(
      'order-123',
      'product-456',
      'customer-789',
      'test@example.com'
    );

    const payload = await verifyReviewToken(token);
    expect(payload).not.toBeNull();
  });

  it('should reject expired token', async () => {
    // Create a token with an expired timestamp
    const now = Math.floor(Date.now() / 1000);
    const expiredPayload = {
      orderId: 'order-123',
      productId: 'product-456',
      customerId: 'customer-789',
      email: 'test@example.com',
      iat: now - 60 * 60 * 24 * 31, // 31 days ago
      exp: now - 60 * 60 * 24, // 1 day ago (expired)
    };

    const payloadBase64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadBase64);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(mockSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const signatureBase64 = Buffer.from(signature).toString('base64url');

    const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payloadBase64}.${signatureBase64}`;

    const payload = await verifyReviewToken(expiredToken);
    expect(payload).toBeNull();
  });

  it('should reject tampered token', async () => {
    const token = await generateReviewToken(
      'order-123',
      'product-456',
      'customer-789',
      'test@example.com'
    );

    // Tamper with the token by changing a character
    const tamperedToken = token.slice(0, -5) + 'XXXXX';

    const payload = await verifyReviewToken(tamperedToken);
    expect(payload).toBeNull();
  });

  it('should reject malformed token', async () => {
    const payload = await verifyReviewToken('not-a-valid-token');
    expect(payload).toBeNull();
  });

  it('should reject token with wrong number of parts', async () => {
    const payload = await verifyReviewToken('part1.part2');
    expect(payload).toBeNull();
  });

  it('should reject empty token', async () => {
    const payload = await verifyReviewToken('');
    expect(payload).toBeNull();
  });
});

describe('isTokenValid', () => {
  it('should return true for valid token', async () => {
    const token = await generateReviewToken(
      'order-123',
      'product-456',
      'customer-789',
      'test@example.com'
    );

    const isValid = await isTokenValid(token);
    expect(isValid).toBe(true);
  });

  it('should return false for invalid token', async () => {
    const isValid = await isTokenValid('invalid-token');
    expect(isValid).toBe(false);
  });
});
