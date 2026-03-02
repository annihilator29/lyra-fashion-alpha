/**
 * Admin Auth Roles Tests
 * Story 7.1a: Admin Dashboard - Foundation
 * AC1: Protected Admin Area
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { 
  isAdmin, 
  getUserRole, 
  requireAdmin, 
  hasRole
} from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('Admin Auth Roles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAdmin', () => {
    it('should return true for admin role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'admin' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('should return true for super_admin role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'super_admin' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('should return false for customer role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'customer' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('should return false when user_metadata is empty', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: {} } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('getUserRole', () => {
    it('should return role from user_metadata', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'admin' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getUserRole();
      expect(result).toBe('admin');
    });

    it('should return customer as default role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: {} } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getUserRole();
      expect(result).toBe('customer');
    });

    it('should return null when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getUserRole();
      expect(result).toBeNull();
    });
  });

  describe('requireAdmin', () => {
    it('should redirect to login when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      await requireAdmin('/login');
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('should redirect to access-denied for customer role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'customer' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      await requireAdmin();
      expect(mockRedirect).toHaveBeenCalledWith('/access-denied');
    });

    it('should not redirect for admin role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'admin' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      await requireAdmin();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should not redirect for super_admin role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'super_admin' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      await requireAdmin();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has exact role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'admin' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await hasRole('admin');
      expect(result).toBe(true);
    });

    it('should return true when user has higher role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'super_admin' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await hasRole('admin');
      expect(result).toBe(true);
    });

    it('should return false when user has lower role', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: '1', user_metadata: { role: 'customer' } } },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await hasRole('admin');
      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await hasRole('admin');
      expect(result).toBe(false);
    });
  });
});
