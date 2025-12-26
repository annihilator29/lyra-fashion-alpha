/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';

// Polyfill global web APIs for tests using Node's native implementations or fallback
// This is necessary because JSDOM does not include them or includes incompatible versions
if (typeof global.Response === 'undefined' || !global.Response.prototype) {
  (global as any).Headers = class Headers {
    private _headers: Record<string, string> = {};
    constructor(init?: any) {
      if (init) {
        Object.entries(init).forEach(([k, v]) => this._headers[k.toLowerCase()] = String(v));
      }
    }
    get(name: string) { return this._headers[name.toLowerCase()] || null; }
    set(name: string, value: string) { this._headers[name.toLowerCase()] = value; }
  };

  (global as any).Response = class Response {
    status: number;
    private _body: any;
    headers: any;
    constructor(body?: any, init?: any) {
      this._body = body;
      this.status = init?.status || 200;
      this.headers = new (global as any).Headers(init?.headers);
    }
    async text() { return String(this._body); }
    async json() { return JSON.parse(this._body); }
    static json(data: any, init?: any) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: { ...init?.headers, 'content-type': 'application/json' }
      });
    }
  };

  (global as any).Request = class Request {
    url: string;
    method: string;
    headers: any;
    private _body: any;
    constructor(input: any, init?: any) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new (global as any).Headers(init?.headers);
      this._body = init?.body;
    }
    async text() { return String(this._body); }
    async json() { return JSON.parse(this._body); }
  };
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/products/dresses',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.RESEND_API_KEY = 're_mock_123';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
