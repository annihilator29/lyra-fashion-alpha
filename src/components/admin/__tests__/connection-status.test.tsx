/**
 * Connection Status Component Tests
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC4: Real-Time Fallback Strategy - Connection Status Indicator
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectionStatus } from '../connection-status';
import type { ConnectionStatus as Status } from '../connection-status';

describe('ConnectionStatus', () => {
  const renderComponent = (status: Status, props = {}) => {
    return render(
      <ConnectionStatus
        status={status}
        onRefresh={jest.fn()}
        lastUpdated={null}
        {...props}
      />
    );
  };

  it('renders connected status with green indicator', () => {
    renderComponent('connected');

    const statusElement = screen.getByTestId('connection-status');
    expect(statusElement).toHaveAttribute('data-status', 'connected');
    expect(statusElement.textContent).toContain('Live updates');
  });

  it('renders polling status with yellow indicator', () => {
    renderComponent('polling');

    const statusElement = screen.getByTestId('connection-status');
    expect(statusElement).toHaveAttribute('data-status', 'polling');
    expect(statusElement.textContent).toContain('Checking for updates');
  });

  it('renders disconnected status with red indicator and refresh button', () => {
    const onRefresh = jest.fn();
    renderComponent('disconnected', { onRefresh });

    const statusElement = screen.getByTestId('connection-status');
    expect(statusElement).toHaveAttribute('data-status', 'disconnected');
    expect(statusElement.textContent).toContain('Manual refresh required');

    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toBeInTheDocument();

    fireEvent.click(refreshButton);
    expect(onRefresh).toHaveBeenCalled();
  });

  it('shows last updated time when disconnected', () => {
    const lastUpdated = new Date('2024-01-01T12:00:00');
    renderComponent('disconnected', { lastUpdated });

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('does not show refresh button when connected', () => {
    renderComponent('connected');

    expect(screen.queryByTestId('refresh-button')).not.toBeInTheDocument();
  });
});
