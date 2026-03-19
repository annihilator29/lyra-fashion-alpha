/**
 * Support Components Tests
 * Story 7.4b: Support Ticket System
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => '/admin/support'),
}));

// Mock server actions — no network calls in component tests
jest.mock('@/app/admin/support/actions', () => ({
  updateTicketStatus: jest.fn().mockResolvedValue({ data: null }),
  assignTicket: jest.fn().mockResolvedValue({ data: null }),
  addTicketMessage: jest.fn().mockResolvedValue({ data: { id: 'msg-1' } }),
}));

jest.mock('@/app/admin/support/templates/actions', () => ({
  deleteTemplate: jest.fn().mockResolvedValue({ data: null }),
  createTemplate: jest.fn().mockResolvedValue({ data: { id: 'tmpl-new' } }),
  updateTemplate: jest.fn().mockResolvedValue({ data: null }),
}));

jest.mock('@/app/admin/emails/actions', () => ({
  sendEmailToCustomer: jest.fn().mockResolvedValue({ data: null }),
}));

// ============================================================
// Mock data
// ============================================================

const mockTicket = {
  id: 'ticket-1',
  ticket_number: 'TKT-ABC-1234',
  customer_id: 'cust-1',
  subject: 'Where is my order?',
  description: 'I placed an order 3 weeks ago.',
  status: 'open' as const,
  priority: 'high' as const,
  assigned_to: null,
  created_by: null,
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
  resolved_at: null,
  customer: {
    id: 'cust-1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    name: null,
  },
};

const mockMessages = [
  {
    id: 'msg-1',
    ticket_id: 'ticket-1',
    sender_id: null,
    sender_type: 'admin' as const,
    content: 'We are looking into this.',
    is_internal: false,
    created_at: '2026-03-02T00:00:00Z',
  },
  {
    id: 'msg-2',
    ticket_id: 'ticket-1',
    sender_id: null,
    sender_type: 'admin' as const,
    content: 'Internal: customer seems frustrated.',
    is_internal: true,
    created_at: '2026-03-02T01:00:00Z',
  },
];

const mockTemplates = [
  {
    id: 'tmpl-1',
    title: 'Shipping Delay Apology',
    subject: 'Update on your order',
    body: 'Hi {{customer_name}}, we apologize for the delay.',
    category: 'shipping' as const,
    created_by: null,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
];

// ============================================================
// TicketDetail
// ============================================================

describe('TicketDetail', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders ticket number and subject', () => {
    const { TicketDetail } = require('@/components/admin/support/ticket-detail');
    render(<TicketDetail ticket={mockTicket} messages={mockMessages} />);

    expect(screen.getByText('TKT-ABC-1234')).toBeInTheDocument();
    expect(screen.getByText('Where is my order?')).toBeInTheDocument();
  });

  it('shows customer name and email', () => {
    const { TicketDetail } = require('@/components/admin/support/ticket-detail');
    render(<TicketDetail ticket={mockTicket} messages={mockMessages} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders correct number of messages', () => {
    const { TicketDetail } = require('@/components/admin/support/ticket-detail');
    render(<TicketDetail ticket={mockTicket} messages={mockMessages} />);

    expect(screen.getByText(/Message Thread \(2\)/)).toBeInTheDocument();
  });

  it('highlights internal notes differently', () => {
    const { TicketDetail } = require('@/components/admin/support/ticket-detail');
    render(<TicketDetail ticket={mockTicket} messages={mockMessages} />);

    // Internal badge should appear once
    const internalBadges = screen.getAllByText('Internal');
    expect(internalBadges.length).toBe(1);
  });

  it('shows status badge', () => {
    const { TicketDetail } = require('@/components/admin/support/ticket-detail');
    render(<TicketDetail ticket={mockTicket} messages={mockMessages} />);

    expect(screen.getAllByText('open').length).toBeGreaterThan(0);
  });

  it('renders empty state when no messages', () => {
    const { TicketDetail } = require('@/components/admin/support/ticket-detail');
    render(<TicketDetail ticket={mockTicket} messages={[]} />);

    expect(screen.getByText('No messages yet.')).toBeInTheDocument();
  });
});

// ============================================================
// TicketsTable
// ============================================================

describe('TicketsTable', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders ticket rows', () => {
    const { TicketsTable } = require('@/components/admin/support/tickets-table');
    render(<TicketsTable initialTickets={[mockTicket]} totalCount={1} />);

    expect(screen.getByText('TKT-ABC-1234')).toBeInTheDocument();
    expect(screen.getByText('Where is my order?')).toBeInTheDocument();
  });

  it('shows empty state when no tickets', () => {
    const { TicketsTable } = require('@/components/admin/support/tickets-table');
    render(<TicketsTable initialTickets={[]} totalCount={0} />);

    expect(screen.getByText('No tickets found.')).toBeInTheDocument();
  });

  it('displays total count', () => {
    const { TicketsTable } = require('@/components/admin/support/tickets-table');
    render(<TicketsTable initialTickets={[mockTicket]} totalCount={1} />);

    expect(screen.getByText(/1 total ticket/)).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    const { TicketsTable } = require('@/components/admin/support/tickets-table');
    render(<TicketsTable initialTickets={[mockTicket]} totalCount={1} />);

    expect(screen.getByText('high')).toBeInTheDocument();
  });
});

// ============================================================
// TemplatesList
// ============================================================

describe('TemplatesList', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders templates', () => {
    const { TemplatesList } = require('@/components/admin/support/templates-list');
    render(<TemplatesList initialTemplates={mockTemplates} />);

    expect(screen.getByText('Shipping Delay Apology')).toBeInTheDocument();
  });

  it('shows empty state when no templates', () => {
    const { TemplatesList } = require('@/components/admin/support/templates-list');
    render(<TemplatesList initialTemplates={[]} />);

    expect(screen.getByText('No templates yet.')).toBeInTheDocument();
  });

  it('shows template count', () => {
    const { TemplatesList } = require('@/components/admin/support/templates-list');
    render(<TemplatesList initialTemplates={mockTemplates} />);

    expect(screen.getByText('1 template')).toBeInTheDocument();
  });
});
