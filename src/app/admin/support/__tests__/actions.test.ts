/**
 * Support Ticket Server Actions Tests
 * Story 7.4b: Support Ticket System
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mocks
jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({ from: jest.fn() })),
}));

jest.mock('@/lib/auth/roles', () => ({
  requireAdmin: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// ============================================================
// Helpers
// ============================================================

function buildChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    ...overrides,
  };
  Object.keys(chain).forEach((k) => {
    if (typeof chain[k].mockReturnThis === 'function' && !overrides[k]) {
      chain[k].mockReturnValue(chain);
    }
  });
  return chain;
}

// ============================================================
// getTickets
// ============================================================

describe('getTickets', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should return tickets list on success', async () => {
    const { getTickets } = await import('../actions');

    const mockTickets = [
      {
        id: 'ticket-1',
        ticket_number: 'TKT-ABC-1234',
        customer_id: 'cust-1',
        subject: 'My order is late',
        status: 'open',
        priority: 'medium',
        assigned_to: null,
        created_by: null,
        created_at: '2026-03-01T00:00:00Z',
        updated_at: '2026-03-01T00:00:00Z',
        resolved_at: null,
      },
    ];

    const chain = buildChain();
    chain.range = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockResolvedValue({ data: mockTickets, error: null, count: 1 });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await getTickets();

    expect(result.tickets).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.hasMore).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it('should handle database errors gracefully', async () => {
    const { getTickets } = await import('../actions');

    const chain = buildChain();
    chain.range = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' }, count: 0 });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await getTickets();

    expect(result.tickets).toEqual([]);
    expect(result.error).toBe('DB error');
  });

  it('should filter by status', async () => {
    const { getTickets } = await import('../actions');

    const chain = buildChain();
    chain.range = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const mockFrom = jest.fn().mockReturnValue(chain);
    
    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: mockFrom } as any);

    const result = await getTickets({ status: 'open' });

    expect(chain.eq).toHaveBeenCalledWith('status', 'open');
    expect(result.tickets).toEqual([]);
  });
});

// ============================================================
// getTicketById
// ============================================================

describe('getTicketById', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should return ticket with messages', async () => {
    const { getTicketById } = await import('../actions');

    const mockTicket = {
      id: 'ticket-1',
      ticket_number: 'TKT-ABC-1234',
      subject: 'Test',
      status: 'open',
      priority: 'medium',
      customer_id: 'cust-1',
    };

    const mockMessages = [
      {
        id: 'msg-1',
        ticket_id: 'ticket-1',
        sender_type: 'admin',
        content: 'Hello!',
        is_internal: false,
        created_at: '2026-03-01T00:00:00Z',
      },
    ];

    const ticketChain = buildChain();
    const msgChain = buildChain();

    ticketChain.single.mockResolvedValue({ data: mockTicket, error: null });
    msgChain.order.mockResolvedValue({ data: mockMessages, error: null });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({
      from: jest
        .fn()
        .mockReturnValueOnce(ticketChain)
        .mockReturnValueOnce(msgChain),
    } as any);

    const result = await getTicketById('ticket-1');

    expect(result.ticket).not.toBeNull();
    expect(result.messages).toHaveLength(1);
    expect(result.error).toBeUndefined();
  });

  it('should return error for non-existent ticket', async () => {
    const { getTicketById } = await import('../actions');

    const chain = buildChain();
    chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await getTicketById('non-existent');

    expect(result.ticket).toBeNull();
    expect(result.error).toBeDefined();
  });
});

// ============================================================
// createTicket
// ============================================================

describe('createTicket', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should create a ticket with valid input', async () => {
    const { createTicket } = await import('../actions');

    const mockResult = { id: 'new-ticket-id', ticket_number: 'TKT-XYZ-5678' };
    const chain = buildChain();
    chain.single.mockResolvedValue({ data: mockResult, error: null });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await createTicket({
      customerId: '123e4567-e89b-12d3-a456-426614174000',
      subject: 'Order not arrived after 3 weeks',
      description: 'I placed my order and it has not arrived.',
      priority: 'high',
    });

    expect(result.error).toBeUndefined();
    expect(result.data?.id).toBe('new-ticket-id');
  });

  it('should reject input failing Zod validation', async () => {
    const { createTicket } = await import('../actions');

    const result = await createTicket({
      customerId: 'not-a-uuid',
      subject: 'Hi', // too short (< 5 chars)
      priority: 'medium',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });
});

// ============================================================
// updateTicketStatus
// ============================================================

describe('updateTicketStatus', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should update ticket status', async () => {
    const { updateTicketStatus } = await import('../actions');

    const chain = buildChain();
    chain.eq.mockResolvedValue({ error: null });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await updateTicketStatus({
      ticketId: '123e4567-e89b-12d3-a456-426614174000',
      status: 'resolved',
    });

    expect(result.error).toBeUndefined();
  });

  it('should reject invalid status', async () => {
    const { updateTicketStatus } = await import('../actions');

    const result = await updateTicketStatus({
      ticketId: '123e4567-e89b-12d3-a456-426614174000',
      // @ts-expect-error intentional bad value
      status: 'unknown_status',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });
});

// ============================================================
// addTicketMessage
// ============================================================

describe('addTicketMessage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should add a public message', async () => {
    const { addTicketMessage } = await import('../actions');

    const chain = buildChain();
    chain.single.mockResolvedValue({ data: { id: 'msg-999' }, error: null });
    chain.eq.mockResolvedValue({ error: null });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await addTicketMessage({
      ticketId: '123e4567-e89b-12d3-a456-426614174000',
      content: 'We are looking into your issue.',
      isInternal: false,
    });

    expect(result.data?.id).toBe('msg-999');
  });

  it('should add an internal note', async () => {
    const { addTicketMessage } = await import('../actions');

    const chain = buildChain();
    chain.single.mockResolvedValue({ data: { id: 'note-123' }, error: null });
    chain.eq.mockResolvedValue({ error: null });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await addTicketMessage({
      ticketId: '123e4567-e89b-12d3-a456-426614174000',
      content: 'Customer seems frustrated — escalate if no reply in 24h.',
      isInternal: true,
    });

    expect(result.data?.id).toBe('note-123');
  });

  it('should reject empty content', async () => {
    const { addTicketMessage } = await import('../actions');

    const result = await addTicketMessage({
      ticketId: '123e4567-e89b-12d3-a456-426614174000',
      content: '',
      isInternal: false,
    });

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });
});

// ============================================================
// updateCustomerNotes
// ============================================================

describe('updateCustomerNotes', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should append a note to the customer', async () => {
    const { updateCustomerNotes } = await import('../actions');

    const chain = buildChain() as any;
    // customer fetch
    chain.single = jest.fn().mockResolvedValue({ data: { support_notes: [] }, error: null });
    // customer update
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.then = jest.fn((cb) => cb({ error: null }));

    const { createAdminClient } = await import('@/lib/supabase/admin');
    jest.mocked(createAdminClient).mockReturnValue({ from: jest.fn().mockReturnValue(chain) } as any);

    const result = await updateCustomerNotes(
      '123e4567-e89b-12d3-a456-426614174000',
      'Customer called to check on refund status.'
    );

    expect(result.error).toBeUndefined();
  });

  it('should reject note exceeding 2000 characters', async () => {
    const { updateCustomerNotes } = await import('../actions');

    const result = await updateCustomerNotes(
      '123e4567-e89b-12d3-a456-426614174000',
      'x'.repeat(2001)
    );

    expect(result.error).toBeDefined();
  });
});
