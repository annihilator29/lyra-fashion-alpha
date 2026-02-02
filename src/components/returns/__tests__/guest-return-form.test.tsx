/**
 * Guest Return Form Tests
 * Story 6.4: Returns & Refunds Processing - Task 9.6
 * 
 * Tests for guest return flow end-to-end
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestReturnForm } from '../guest-return-form';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('GuestReturnForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the lookup form with order number and email fields', () => {
    render(<GuestReturnForm />);

    expect(screen.getByLabelText(/Order Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Find My Order/i })).toBeInTheDocument();
  });

  it('shows validation error for empty order number', async () => {
    const user = userEvent.setup();
    render(<GuestReturnForm />);

    const submitButton = screen.getByRole('button', { name: /Find My Order/i });
    await user.click(submitButton);

    expect(screen.getByText(/Order number is required/i)).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<GuestReturnForm />);

    const orderInput = screen.getByLabelText(/Order Number/i);
    await user.type(orderInput, 'ORD-123');

    const submitButton = screen.getByRole('button', { name: /Find My Order/i });
    await user.click(submitButton);

    expect(screen.getByText(/Email address is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<GuestReturnForm />);

    const orderInput = screen.getByLabelText(/Order Number/i);
    const emailInput = screen.getByLabelText(/Email Address/i);

    await user.type(orderInput, 'ORD-123');
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /Find My Order/i });
    await user.click(submitButton);

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it('navigates to order lookup with query params on valid submission', async () => {
    const user = userEvent.setup();
    const { useRouter } = await import('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(<GuestReturnForm />);

    const orderInput = screen.getByLabelText(/Order Number/i);
    const emailInput = screen.getByLabelText(/Email Address/i);

    await user.type(orderInput, 'ORD-2025-001');
    await user.type(emailInput, 'customer@example.com');

    const submitButton = screen.getByRole('button', { name: /Find My Order/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/guest-return?order=ORD-2025-001&email=customer%40example.com'
      );
    });
  });

  it('has link to login page for registered users', () => {
    render(<GuestReturnForm />);

    const loginLink = screen.getByText(/Sign in/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows helper text for order number field', () => {
    render(<GuestReturnForm />);

    expect(screen.getByText(/Found in your order confirmation email/i)).toBeInTheDocument();
  });

  it('shows helper text for email field', () => {
    render(<GuestReturnForm />);

    expect(screen.getByText(/The email address used when placing the order/i)).toBeInTheDocument();
  });

  it('disables inputs while loading', async () => {
    const user = userEvent.setup();
    const { useRouter } = await import('next/navigation');
    // Delay the navigation to test loading state
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(() => new Promise(resolve => setTimeout(resolve, 100))),
    });

    render(<GuestReturnForm />);

    const orderInput = screen.getByLabelText(/Order Number/i);
    const emailInput = screen.getByLabelText(/Email Address/i);

    await user.type(orderInput, 'ORD-2025-001');
    await user.type(emailInput, 'customer@example.com');

    const submitButton = screen.getByRole('button', { name: /Find My Order/i });
    await user.click(submitButton);

    // Inputs should be disabled during submission
    expect(orderInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
  });
});
