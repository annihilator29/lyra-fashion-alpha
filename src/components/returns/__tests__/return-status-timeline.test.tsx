/**
 * Return Status Timeline Tests
 * Story 6.4: Returns & Refunds Processing - Task 9.1
 * 
 * Unit tests for ReturnStatusTimeline component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReturnStatusTimeline } from '../return-status-timeline';
import type { Return, ReturnStatus } from '@/types/returns';

const createMockReturn = (status: ReturnStatus, overrides = {}): Return => ({
  id: 'return-123',
  order_id: 'order-123',
  order_item_ids: ['item-1'],
  reason: 'size_fit',
  status,
  rma_number: 'RMA-123-20250202',
  refund_amount: 50.00,
  requested_at: '2025-02-01T10:00:00Z',
  created_at: '2025-02-01T10:00:00Z',
  updated_at: '2025-02-01T10:00:00Z',
  condition_notes: null,
  shipping_label_url: null,
  tracking_number: null,
  tracking_url: null,
  approved_at: null,
  shipped_at: null,
  received_at: null,
  inspected_at: null,
  inspected_by: null,
  inspection_notes: null,
  inspection_photos: null,
  rejected_at: null,
  rejection_reason: null,
  refunded_at: null,
  stripe_refund_id: null,
  ...overrides,
});

describe('ReturnStatusTimeline', () => {
  it('renders requested status correctly', () => {
    const returnData = createMockReturn('requested');
    render(<ReturnStatusTimeline return={returnData} />);

    expect(screen.getByText('RMA-123-20250202')).toBeInTheDocument();
    expect(screen.getByText('Requested')).toBeInTheDocument();
  });

  it('renders approved status with tracking info', () => {
    const returnData = createMockReturn('approved', {
      approved_at: '2025-02-02T10:00:00Z',
      tracking_number: 'TRACK123456',
      tracking_url: 'https://track.example.com/123',
      shipping_label_url: 'https://example.com/label.pdf',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('TRACK123456')).toBeInTheDocument();
  });

  it('renders shipped status', () => {
    const returnData = createMockReturn('shipped', {
      shipped_at: '2025-02-03T10:00:00Z',
      tracking_number: 'TRACK123456',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    expect(screen.getByText('Shipped')).toBeInTheDocument();
  });

  it('renders received status', () => {
    const returnData = createMockReturn('received', {
      received_at: '2025-02-04T10:00:00Z',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    expect(screen.getByText('Received')).toBeInTheDocument();
  });

  it('renders inspected status', () => {
    const returnData = createMockReturn('inspected', {
      inspected_at: '2025-02-04T14:00:00Z',
      inspection_notes: 'Items in good condition',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    expect(screen.getByText('Inspected')).toBeInTheDocument();
  });

  it('renders refunded status with amount', () => {
    const returnData = createMockReturn('refunded', {
      refunded_at: '2025-02-05T10:00:00Z',
      stripe_refund_id: 're_1234567890',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    expect(screen.getByText('Refunded')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('renders rejected status with reason', () => {
    const returnData = createMockReturn('rejected', {
      rejected_at: '2025-02-04T10:00:00Z',
      rejection_reason: 'Item shows signs of wear',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Item shows signs of wear')).toBeInTheDocument();
  });

  it('displays return reason', () => {
    const returnData = createMockReturn('requested', {
      reason: 'defective',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    // Reason should be displayed (mapped from reason code to label)
    expect(screen.getByText(/Reason/i)).toBeInTheDocument();
  });

  it('displays condition notes if provided', () => {
    const returnData = createMockReturn('requested', {
      condition_notes: 'Item arrived with small tear',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    expect(screen.getByText('Item arrived with small tear')).toBeInTheDocument();
  });

  it('shows timeline steps up to current status', () => {
    const returnData = createMockReturn('received', {
      approved_at: '2025-02-02T10:00:00Z',
      shipped_at: '2025-02-03T10:00:00Z',
      received_at: '2025-02-04T10:00:00Z',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    // Should show steps: Requested, Approved, Shipped, Received
    expect(screen.getByText('Requested')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Received')).toBeInTheDocument();
  });

  it('provides link to print shipping label when available', () => {
    const returnData = createMockReturn('approved', {
      shipping_label_url: 'https://example.com/label.pdf',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    const labelLink = screen.getByText(/Print Shipping Label/i);
    expect(labelLink).toBeInTheDocument();
    expect(labelLink).toHaveAttribute('href', 'https://example.com/label.pdf');
  });

  it('provides link to track package when tracking URL available', () => {
    const returnData = createMockReturn('shipped', {
      tracking_url: 'https://track.example.com/123',
    });
    render(<ReturnStatusTimeline return={returnData} />);

    const trackLink = screen.getByText(/Track Package/i);
    expect(trackLink).toBeInTheDocument();
    expect(trackLink).toHaveAttribute('href', 'https://track.example.com/123');
  });
});
