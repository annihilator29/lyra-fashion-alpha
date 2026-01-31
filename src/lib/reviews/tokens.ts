export interface ReviewTokenPayload {
  orderId: string;
  productId: string;
  customerId: string;
  email: string;
  iat: number;
  exp: number;
}

const TOKEN_EXPIRY_DAYS = 30;

/**
 * Generate a review token for a specific order and product
 * This is typically called when sending review request emails
 */
export async function generateReviewToken(
  orderId: string,
  productId: string,
  customerId: string,
  email: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

  const payload: ReviewTokenPayload = {
    orderId,
    productId,
    customerId,
    email,
    iat: now,
    exp,
  };

  // Encode payload to base64
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // Create signature using a secret (in production, use a proper JWT library)
  const secret = process.env.REVIEW_TOKEN_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-secret';
  const signature = await createSignature(payloadBase64, secret);
  
  // Return token in JWT format (header.payload.signature)
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payloadBase64}.${signature}`;
}

/**
 * Verify a review token and return the payload if valid
 */
export async function verifyReviewToken(token: string): Promise<ReviewTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [, payloadBase64, signature] = parts;

    // Verify signature
    const secret = process.env.REVIEW_TOKEN_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-secret';
    const expectedSignature = await createSignature(payloadBase64, secret);
    
    if (signature !== expectedSignature) {
      return null;
    }

    // Decode and parse payload
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload: ReviewTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if a review token is valid (not expired and properly signed)
 */
export async function isTokenValid(token: string): Promise<boolean> {
  const payload = await verifyReviewToken(token);
  return payload !== null;
}

/**
 * Create HMAC signature for token verification
 */
async function createSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return Buffer.from(signature).toString('base64url');
}
