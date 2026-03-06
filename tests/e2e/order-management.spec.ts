/**
 * E2E Tests for Order Management & Fulfillment Tools
 * Story 7.3: Order Management & Fulfillment Tools
 * 
 * These tests cover the complete order management workflow:
 * - Order listing and filtering
 * - Order detail viewing
 * - Status updates
 * - Shipping and tracking
 * - Refund processing
 * - Bulk operations
 */

import { test, expect, type Page } from '@playwright/test';

// Test admin credentials
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@lyrafashion.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'testpassword123';

// Helper function to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin/dashboard');
}

// Helper function to create a test order (via API)
async function createTestOrder(page: Page): Promise<string> {
  // This would typically call an API endpoint to create a test order
  // For now, we'll assume orders exist in the test database
  return 'test-order-id';
}

test.describe('Order Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe('AC1: Order Listing View', () => {
    test('should display orders table with pagination', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Check table headers
      await expect(page.locator('th:has-text("Order")')).toBeVisible();
      await expect(page.locator('th:has-text("Customer")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Total")')).toBeVisible();
      
      // Check pagination controls
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    });

    test('should filter orders by status', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Open status filter
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Shipped');
      
      // Wait for table to update
      await page.waitForTimeout(500);
      
      // Verify URL updated
      await expect(page).toHaveURL(/status=shipped/);
    });

    test('should search orders by order number', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Enter search term
      await page.fill('[data-testid="search-input"]', 'LF-001');
      await page.press('[data-testid="search-input"]', 'Enter');
      
      // Wait for results
      await page.waitForTimeout(500);
      
      // Verify search is applied
      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toHaveValue('LF-001');
    });

    test('should filter by date range', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Open date filter
      await page.click('[data-testid="date-filter"]');
      
      // Select date range
      await page.fill('input[name="dateFrom"]', '2025-01-01');
      await page.fill('input[name="dateTo"]', '2025-01-31');
      await page.click('button:has-text("Apply")');
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Verify URL contains date params
      await expect(page).toHaveURL(/dateFrom=/);
    });

    test('should sort columns', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Click on Total column header to sort
      await page.click('th:has-text("Total")');
      
      // Wait for sort to apply
      await page.waitForTimeout(300);
      
      // Click again to reverse sort
      await page.click('th:has-text("Total")');
      
      await page.waitForTimeout(300);
    });

    test('should show quick view modal', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Click quick view button on first order
      await page.click('[data-testid="quick-view-btn"]:first-of-type');
      
      // Verify modal opens
      await expect(page.locator('[data-testid="order-quick-view"]')).toBeVisible();
      
      // Close modal
      await page.click('[data-testid="close-modal"]');
      await expect(page.locator('[data-testid="order-quick-view"]')).not.toBeVisible();
    });
  });

  test.describe('AC2: Order Detail View', () => {
    test('should display complete order details', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Click on first order to view details
      await page.click('tr[data-order-id]:first-of-type');
      
      // Verify URL changed to order detail
      await expect(page).toHaveURL(/\/admin\/orders\//);
      
      // Verify order information sections
      await expect(page.locator('h1:has-text("Order")')).toBeVisible();
      await expect(page.locator('text=Customer Information')).toBeVisible();
      await expect(page.locator('text=Order Items')).toBeVisible();
      await expect(page.locator('text=Payment Information')).toBeVisible();
      await expect(page.locator('text=Order Timeline')).toBeVisible();
    });

    test('should show customer shipping and billing addresses', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Verify shipping address section
      await expect(page.locator('text=Shipping Address')).toBeVisible();
      
      // Verify billing address section
      await expect(page.locator('text=Billing Address')).toBeVisible();
    });

    test('should display order items with details', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Verify order items table
      await expect(page.locator('table:has-text("Product")')).toBeVisible();
      await expect(page.locator('th:has-text("SKU")')).toBeVisible();
      await expect(page.locator('th:has-text("Quantity")')).toBeVisible();
      await expect(page.locator('th:has-text("Price")')).toBeVisible();
    });

    test('should show customer order history', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Verify order history section
      await expect(page.locator('text=Customer History')).toBeVisible();
    });
  });

  test.describe('AC3: Order Status Updates', () => {
    test('should update order status with valid transition', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Click update status button
      await page.click('button:has-text("Update Status")');
      
      // Select new status
      await page.click('[data-testid="status-select"]');
      await page.click('text=Processing');
      
      // Add notes
      await page.fill('textarea[name="notes"]', 'Moving to production');
      
      // Submit
      await page.click('button:has-text("Update")');
      
      // Verify success message
      await expect(page.locator('text=Order status updated')).toBeVisible();
    });

    test('should prevent invalid status transitions', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Click update status button
      await page.click('button:has-text("Update Status")');
      
      // Try to select invalid status (should be disabled)
      const cancelledOption = page.locator('option:has-text("Cancelled")');
      await expect(cancelledOption).toHaveAttribute('disabled');
    });
  });

  test.describe('AC4: Shipping & Tracking Management', () => {
    test('should add tracking information', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Click add tracking button
      await page.click('button:has-text("Add Tracking")');
      
      // Select carrier
      await page.click('[data-testid="carrier-select"]');
      await page.click('text=UPS');
      
      // Enter tracking number
      await page.fill('input[name="trackingNumber"]', '1Z999AA1234567890');
      
      // Submit
      await page.click('button:has-text("Save Tracking")');
      
      // Verify success
      await expect(page.locator('text=Tracking information added')).toBeVisible();
    });

    test('should validate tracking number', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Click add tracking button
      await page.click('button:has-text("Add Tracking")');
      
      // Enter invalid tracking number (too short)
      await page.fill('input[name="trackingNumber"]', '123');
      await page.click('button:has-text("Save Tracking")');
      
      // Verify error
      await expect(page.locator('text=at least 5 characters')).toBeVisible();
    });

    test('should generate packing slip PDF', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Click print packing slip button
      await page.click('button:has-text("Print Packing Slip")');
      
      // Verify download starts (PDF generation)
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download PDF")');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('AC5: Refund & Return Processing', () => {
    test('should process partial refund', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Click process refund button
      await page.click('button:has-text("Process Refund")');
      
      // Enter refund amount
      await page.fill('input[name="amount"]', '25.00');
      
      // Select reason
      await page.click('[data-testid="refund-reason"]');
      await page.click('text=Defective');
      
      // Add notes
      await page.fill('textarea[name="notes"]', 'Item arrived damaged');
      
      // Submit
      await page.click('button:has-text("Process Refund")');
      
      // Verify success
      await expect(page.locator('text=Refund processed successfully')).toBeVisible();
    });

    test('should validate refund amount', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Click process refund button
      await page.click('button:has-text("Process Refund")');
      
      // Enter amount exceeding order total
      await page.fill('input[name="amount"]', '9999.00');
      await page.click('button:has-text("Process Refund")');
      
      // Verify error
      await expect(page.locator('text=exceeds remaining order total')).toBeVisible();
    });

    test('should generate RMA number', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Click return item button
      await page.click('button:has-text("Process Return")');
      
      // Verify RMA is generated and displayed
      await expect(page.locator('text=RMA-')).toBeVisible();
    });
  });

  test.describe('AC6: Bulk Order Operations', () => {
    test('should select multiple orders', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Select multiple orders using checkboxes
      await page.click('tr[data-order-id]:first-of-type input[type="checkbox"]');
      await page.click('tr[data-order-id]:nth-of-type(2) input[type="checkbox"]');
      
      // Verify bulk action toolbar appears
      await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
      await expect(page.locator('text=2 selected')).toBeVisible();
    });

    test('should bulk update status', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Select orders
      await page.click('tr[data-order-id]:first-of-type input[type="checkbox"]');
      await page.click('tr[data-order-id]:nth-of-type(2) input[type="checkbox"]');
      
      // Click bulk update status
      await page.click('[data-testid="bulk-update-status"]');
      
      // Select new status
      await page.click('text=Processing');
      
      // Confirm
      await page.click('button:has-text("Update")');
      
      // Verify success
      await expect(page.locator('text=Status updated for')).toBeVisible();
    });

    test('should export orders to CSV', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Select orders
      await page.click('tr[data-order-id]:first-of-type input[type="checkbox"]');
      
      // Click export
      await page.click('button:has-text("Export")');
      
      // Verify download
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export to CSV")');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should bulk print packing slips', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Select orders
      await page.click('tr[data-order-id]:first-of-type input[type="checkbox"]');
      await page.click('tr[data-order-id]:nth-of-type(2) input[type="checkbox"]');
      
      // Click bulk print
      await page.click('button:has-text("Print Packing Slips")');
      
      // Verify download of batch PDF
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download All")');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('AC7: Order Search & Filters', () => {
    test('should search by customer name', async ({ page }) => {
      await page.goto('/admin/orders');
      
      await page.fill('[data-testid="search-input"]', 'John');
      await page.press('[data-testid="search-input"]', 'Enter');
      
      await page.waitForTimeout(500);
      
      // Verify search is applied
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('John');
    });

    test('should filter by payment status', async ({ page }) => {
      await page.goto('/admin/orders');
      
      await page.click('[data-testid="payment-status-filter"]');
      await page.click('text=Paid');
      
      await page.waitForTimeout(500);
      
      await expect(page).toHaveURL(/paymentStatus=paid/);
    });

    test('should combine multiple filters', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Apply status filter
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Shipped');
      await page.waitForTimeout(300);
      
      // Apply date filter
      await page.click('[data-testid="date-filter"]');
      await page.fill('input[name="dateFrom"]', '2025-01-01');
      await page.click('button:has-text("Apply")');
      await page.waitForTimeout(300);
      
      // Verify both filters in URL
      await expect(page).toHaveURL(/status=shipped/);
      await expect(page).toHaveURL(/dateFrom=/);
    });
  });

  test.describe('AC8: Internal Notes & Communication', () => {
    test('should add internal note', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      // Scroll to notes section
      await page.click('text=Internal Notes');
      
      // Add note
      await page.fill('textarea[name="note"]', 'Customer called about shipping');
      await page.click('button:has-text("Add Note")');
      
      // Verify note appears
      await expect(page.locator('text=Customer called about shipping')).toBeVisible();
    });

    test('should display note author and timestamp', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      await page.click('text=Internal Notes');
      
      // Verify note metadata
      await expect(page.locator('[data-testid="note-author"]')).toBeVisible();
      await expect(page.locator('[data-testid="note-timestamp"]')).toBeVisible();
    });

    test('should delete own note', async ({ page }) => {
      await page.goto('/admin/orders/test-order-id');
      
      await page.click('text=Internal Notes');
      
      // Add a note first
      await page.fill('textarea[name="note"]', 'Temporary note');
      await page.click('button:has-text("Add Note")');
      
      // Delete the note
      await page.click('[data-testid="delete-note"]:last-of-type');
      
      // Confirm deletion
      await page.click('button:has-text("Delete")');
      
      // Verify note removed
      await expect(page.locator('text=Temporary note')).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Tab through table rows
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is on interactive element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Check for ARIA labels on status badges
      const statusBadges = page.locator('[role="status"]');
      await expect(statusBadges.first()).toHaveAttribute('aria-label');
    });
  });
});
