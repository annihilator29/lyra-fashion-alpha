/**
 * Support Template Server Actions Tests
 * Story 7.4b: Support Ticket System
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({ from: jest.fn() })),
}));

jest.mock('@/lib/auth/roles', () => ({
  requireAdmin: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

function buildChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    ...overrides,
  };
  return chain;
}

// ============================================================
// getTemplates
// ============================================================

describe('getTemplates', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should return all templates', async () => {
    const { getTemplates } = await import('../actions');

    const mockTemplates = [
      {
        id: 'tmpl-1',
        title: 'Shipping Delay',
        subject: 'Update on your order',
        body: 'Hi {{customer_name}}...',
        category: 'shipping',
        created_by: null,
        created_at: '2026-03-01T00:00:00Z',
        updated_at: '2026-03-01T00:00:00Z',
      },
    ];

    const chain = buildChain() as any;
    chain.select = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockReturnValue(chain);
    chain.then = jest.fn((cb) => cb({ data: mockTemplates, error: null, count: 1 }));

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await getTemplates();

    expect(result.templates).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter by category', async () => {
    const { getTemplates } = await import('../actions');

    const chain = buildChain() as any;
    chain.select = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockReturnValue(chain);
    chain.then = jest.fn((cb) => cb({ data: [], error: null, count: 0 }));

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await getTemplates('shipping');

    expect(chain.eq).toHaveBeenCalledWith('category', 'shipping');
    expect(result.templates).toEqual([]);
  });
});

// ============================================================
// createTemplate
// ============================================================

describe('createTemplate', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should create template with valid input', async () => {
    const { createTemplate } = await import('../actions');

    const chain = buildChain();
    chain.single.mockResolvedValue({ data: { id: 'new-tmpl-id' }, error: null });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await createTemplate({
      title: 'Welcome Template',
      subject: 'Welcome to Lyra {{customer_name}}',
      body: 'Thank you for reaching out!',
      category: 'general',
    });

    expect(result.error).toBeUndefined();
    expect(result.data?.id).toBe('new-tmpl-id');
  });

  it('should reject template with empty title', async () => {
    const { createTemplate } = await import('../actions');

    const result = await createTemplate({
      title: '',
      subject: 'Test Subject',
      body: 'Test body content here',
      category: 'general',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('should reject template with invalid category', async () => {
    const { createTemplate } = await import('../actions');

    const result = await createTemplate({
      title: 'Test',
      subject: 'Test Subject',
      body: 'Body content',
      // @ts-expect-error intentional bad value
      category: 'unknown_category',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });
});

// ============================================================
// updateTemplate
// ============================================================

describe('updateTemplate', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should update template fields', async () => {
    const { updateTemplate } = await import('../actions');

    const chain = buildChain();
    chain.eq.mockResolvedValue({ error: null });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await updateTemplate('tmpl-1', {
      title: 'Updated Title',
      subject: 'Updated Subject',
      body: 'Updated body content',
      category: 'returns',
    });

    expect(result.error).toBeUndefined();
  });
});

// ============================================================
// deleteTemplate
// ============================================================

describe('deleteTemplate', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should delete a template', async () => {
    const { deleteTemplate } = await import('../actions');

    const chain = buildChain();
    chain.eq.mockResolvedValue({ error: null });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await deleteTemplate('tmpl-1');

    expect(result.error).toBeUndefined();
  });

  it('should return error if templateId is empty', async () => {
    const { deleteTemplate } = await import('../actions');

    const result = await deleteTemplate('');

    expect(result.error).toBeDefined();
  });
});
