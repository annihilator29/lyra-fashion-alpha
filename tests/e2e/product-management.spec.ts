/**
 * E2E Tests: Product Management
 * Story 7.2: Product Management Interface
 * Phase 7: Testing & Polish
 */

import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  // Admin credentials - must be set in environment variables
  const adminEmail = process.env.TEST_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;

  test.beforeAll(() => {
    if (!adminEmail || !adminPassword) {
      throw new Error('TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables must be set');
    }
  });

  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin');
    
    // Login as admin
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL(/\/admin/);
  });

  test.describe('Product Listing Page', () => {
    test('should display products table', async ({ page }) => {
      await page.goto('/admin/products');
      
      // Wait for page to load
      await expect(page.locator('h1')).toContainText('Products');
      
      // Check table exists
      await expect(page.locator('table')).toBeVisible();
      
      // Check for Add Product button
      await expect(page.getByRole('button', { name: /add product/i })).toBeVisible();
    });

    test('should search products by name', async ({ page }) => {
      await page.goto('/admin/products');
      
      // Wait for products to load
      await page.waitForSelector('table');
      
      // Enter search term
      const searchInput = page.getByPlaceholder(/search by name or sku/i);
      await searchInput.fill('dress');
      
      // Wait for search results to update (network idle or specific response)
      await page.waitForLoadState('networkidle');
      
      // Check that only matching products are shown
      const tableRows = page.locator('tbody tr');
      await expect(tableRows.first()).toBeVisible();
    });

    test('should filter products by category', async ({ page }) => {
      await page.goto('/admin/products');
      
      // Wait for filters to load
      await page.waitForSelector('select');
      
      // Select category filter
      const categorySelect = page.getByRole('combobox').nth(0);
      await categorySelect.selectOption('Dresses');
      
      // Wait for filter to apply
      await page.waitForLoadState('networkidle');
      
      // Check filtered results
      const tableRows = page.locator('tbody tr');
      await expect(tableRows.first()).toBeVisible();
    });

    test('should filter products by status', async ({ page }) => {
      await page.goto('/admin/products');
      
      // Select status filter
      const statusSelect = page.getByRole('combobox').nth(1);
      await statusSelect.selectOption('active');
      
      // Wait for filter to apply
      await page.waitForLoadState('networkidle');
      
      // Check that only active products are shown
      const tableRows = page.locator('tbody tr');
      await expect(tableRows.first()).toBeVisible();
    });

    test('should sort products by clicking column headers', async ({ page }) => {
      await page.goto('/admin/products');
      
      // Wait for table to load
      await page.waitForSelector('table');
      
      // Click on Price column header
      const priceHeader = page.getByRole('button', { name: /price/i }).first();
      await priceHeader.click();
      
      // Wait for sort to apply
      await page.waitForLoadState('networkidle');
      
      // Check for sort indicator
      await expect(priceHeader).toContainText('▲');
    });

    test('should select multiple products for bulk action', async ({ page }) => {
      await page.goto('/admin/products');
      
      // Wait for table to load
      await page.waitForSelector('table');
      
      // Click on first checkbox
      const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
      await firstCheckbox.click();
      
      // Check that bulk action button appears
      await expect(page.getByRole('button', { name: /bulk actions/i })).toBeVisible();
    });

    test('should open bulk action dialog', async ({ page }) => {
      await page.goto('/admin/products');
      
      // Wait for table to load
      await page.waitForSelector('table');
      
      // Select a product
      const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
      await firstCheckbox.click();
      
      // Click bulk actions button
      const bulkActionButton = page.getByRole('button', { name: /bulk actions/i });
      await bulkActionButton.click();
      
      // Check dialog is open
      await expect(page.getByRole('dialog')).toBeVisible();
    });
  });

  test.describe('Create Product', () => {
    test('should display create product form', async ({ page }) => {
      await page.goto('/admin/products/new');
      
      // Wait for form to load
      await expect(page.locator('h1')).toContainText('Create Product');
      
      // Check form sections exist
      await expect(page.getByRole('tab', { name: /basic info/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /media/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /variants/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /seo/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /craftsmanship/i })).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/admin/products/new');
      
      // Try to submit without filling required fields
      const saveButton = page.getByRole('button', { name: /create product/i });
      await saveButton.click();
      
      // Check for validation errors
      await expect(page.getByText(/product name is required/i)).toBeVisible();
    });

    test('should auto-generate slug from name', async ({ page }) => {
      await page.goto('/admin/products/new');
      
      // Fill product name
      const nameInput = page.getByLabel(/product name/i);
      await nameInput.fill('Test Product Name');
      
      // Wait for slug generation (blur from name field triggers it)
      await nameInput.blur();
      
      // Check slug was generated
      const slugInput = page.getByLabel(/slug/i);
      await expect(slugInput).toHaveValue('test-product-name');
    });

    test('should create product with basic info', async ({ page }) => {
      await page.goto('/admin/products/new');
      
      // Fill basic info
      await page.getByLabel(/product name/i).fill('E2E Test Product');
      await page.getByLabel(/slug/i).fill('e2e-test-product');
      await page.getByLabel(/description/i).fill('Test product description');
      
      // Select category
      const categorySelect = page.getByLabel(/category/i);
      await categorySelect.selectOption('Dresses');
      
      // Fill price
      await page.getByLabel(/base price/i).fill('9999');
      
      // Save as draft
      const saveButton = page.getByRole('button', { name: /save as draft/i });
      await saveButton.click();
      
      // Wait for navigation
      await page.waitForURL(/\/admin\/products/);
      
      // Check success message
      await expect(page.getByText(/product created successfully/i)).toBeVisible();
    });

    test('should add product images', async ({ page }) => {
      await page.goto('/admin/products/new');
      
      // Fill basic info
      await page.getByLabel(/product name/i).fill('Product with Images');
      await page.getByLabel(/slug/i).fill('product-with-images');
      await page.getByLabel(/category/i).selectOption('Tops');
      await page.getByLabel(/base price/i).fill('5999');
      
      // Navigate to media tab
      const mediaTab = page.getByRole('tab', { name: /media/i });
      await mediaTab.click();
      
      // Upload image (using file input)
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
      });
      
      // Wait for upload to complete (look for success indicator)
      await page.waitForLoadState('networkidle');
      
      // Check image preview exists
      await expect(page.locator('img[alt*="Product image"]')).toBeVisible();
    });

    test('should add product variants', async ({ page }) => {
      await page.goto('/admin/products/new');
      
      // Fill basic info
      await page.getByLabel(/product name/i).fill('Product with Variants');
      await page.getByLabel(/slug/i).fill('product-with-variants');
      await page.getByLabel(/category/i).selectOption('Bottoms');
      await page.getByLabel(/base price/i).fill('7999');
      
      // Navigate to variants tab
      const variantsTab = page.getByRole('tab', { name: /variants/i });
      await variantsTab.click();
      
      // Add variant
      const addVariantButton = page.getByRole('button', { name: /add variant/i });
      await addVariantButton.click();
      
      // Fill variant details in dialog
      await page.getByLabel(/size/i).selectOption('M');
      await page.getByLabel(/color name/i).fill('Navy');
      await page.getByLabel(/color hex code/i).fill('#000080');
      
      // Confirm add
      const confirmButton = page.getByRole('button', { name: /add variant/i }).last();
      await confirmButton.click();
      
      // Wait for variant to appear in table
      await expect(page.locator('tbody')).toContainText('Navy');
    });

    test('should create complete product with all sections', async ({ page }) => {
      await page.goto('/admin/products/new');
      
      // Basic Info
      await page.getByLabel(/product name/i).fill('Complete E2E Product');
      await page.getByLabel(/slug/i).fill('complete-e2e-product');
      await page.getByLabel(/description/i).fill('Complete product description');
      await page.getByLabel(/category/i).selectOption('Dresses');
      await page.getByLabel(/base price/i).fill('12999');
      await page.getByLabel(/compare-at price/i).fill('15999');
      
      // Variants
      const variantsTab = page.getByRole('tab', { name: /variants/i });
      await variantsTab.click();
      
      const addVariantButton = page.getByRole('button', { name: /add variant/i });
      await addVariantButton.click();
      await page.getByLabel(/size/i).selectOption('S');
      await page.getByLabel(/color name/i).fill('Black');
      await page.getByLabel(/color hex code/i).fill('#000000');
      const confirmButton = page.getByRole('button', { name: /add variant/i }).last();
      await confirmButton.click();
      
      // SEO
      const seoTab = page.getByRole('tab', { name: /seo/i });
      await seoTab.click();
      await page.getByLabel(/meta title/i).fill('Complete Product - SEO Test');
      await page.getByLabel(/meta description/i).fill('SEO description for testing');
      
      // Save
      const saveButton = page.getByRole('button', { name: /create product/i });
      await saveButton.click();
      
      // Wait for navigation
      await page.waitForURL(/\/admin\/products/);
      
      // Check success
      await expect(page.getByText(/product created successfully/i)).toBeVisible();
      
      // Verify product appears in list
      await expect(page.locator('table')).toContainText('Complete E2E Product');
    });
  });

  test.describe('Edit Product', () => {
    test('should load product data for editing', async ({ page }) => {
      // First, get a product ID from the listing
      await page.goto('/admin/products');
      await page.waitForSelector('table');
      
      // Click edit on first product
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      await editButton.click();
      
      // Wait for edit page to load
      await expect(page.locator('h1')).toContainText('Edit Product');
      
      // Check form is populated
      await expect(page.getByLabel(/product name/i)).not.toBeEmpty();
    });

    test('should update product information', async ({ page }) => {
      // Navigate to first product edit page
      await page.goto('/admin/products');
      await page.waitForSelector('table');
      
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      await editButton.click();
      await expect(page.locator('h1')).toContainText('Edit Product');
      
      // Update product name
      const nameInput = page.getByLabel(/product name/i);
      const originalName = await nameInput.inputValue();
      await nameInput.fill(`${originalName} - Updated`);
      
      // Update price
      const priceInput = page.getByLabel(/base price/i);
      await priceInput.fill('10999');
      
      // Save changes
      const saveButton = page.getByRole('button', { name: /save changes/i });
      await saveButton.click();
      
      // Wait for navigation
      await page.waitForURL(/\/admin\/products/);
      
      // Check success message
      await expect(page.getByText(/product updated successfully/i)).toBeVisible();
    });

    test('should preview product', async ({ page }) => {
      // Navigate to edit page
      await page.goto('/admin/products');
      await page.waitForSelector('table');
      
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      await editButton.click();
      
      // Click preview button
      const previewButton = page.getByRole('button', { name: /preview/i });
      const [newPage] = await Promise.all([
        page.waitForEvent('popup'),
        previewButton.click(),
      ]);
      
      // Wait for preview page to load
      await newPage.waitForLoadState();
      
      // Check preview URL contains preview=true
      expect(newPage.url()).toContain('preview=true');
      
      // Close preview
      await newPage.close();
    });

    test('should publish product', async ({ page }) => {
      // Navigate to edit page
      await page.goto('/admin/products');
      await page.waitForSelector('table');
      
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      await editButton.click();
      
      // Click publish button
      const publishButton = page.getByRole('button', { name: /publish/i });
      await publishButton.click();
      
      // Wait for navigation
      await page.waitForURL(/\/admin\/products/);
      
      // Check success
      await expect(page.getByText(/product updated successfully/i)).toBeVisible();
    });
  });

  test.describe('Bulk Actions', () => {
    test('should bulk update product status', async ({ page }) => {
      await page.goto('/admin/products');
      await page.waitForSelector('table');
      
      // Select multiple products
      const checkboxes = page.locator('tbody input[type="checkbox"]');
      const count = await checkboxes.count();
      
      if (count > 0) {
        await checkboxes.nth(0).click();
        if (count > 1) {
          await checkboxes.nth(1).click();
        }
        
        // Click bulk actions
        const bulkActionButton = page.getByRole('button', { name: /bulk actions/i });
        await bulkActionButton.click();
        
        // Select status change
        const actionSelect = page.getByRole('combobox').first();
        await actionSelect.selectOption('status');
        
        const statusSelect = page.getByRole('combobox').nth(3);
        await statusSelect.selectOption('archived');
        
        // Apply
        const applyButton = page.getByRole('button', { name: /apply/i });
        await applyButton.click();
        
        // Wait for update
        await page.waitForLoadState('networkidle');
        
        // Check success
        await expect(page.getByText(/updated.*product/i)).toBeVisible();
      }
    });

    test('should bulk export products to CSV', async ({ page }) => {
      await page.goto('/admin/products');
      await page.waitForSelector('table');
      
      // Select products
      const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
      await firstCheckbox.click();
      
      // Click bulk actions
      const bulkActionButton = page.getByRole('button', { name: /bulk actions/i });
      await bulkActionButton.click();
      
      // Select export
      const actionSelect = page.getByRole('combobox').first();
      await actionSelect.selectOption('export');
      
      // Apply
      const applyButton = page.getByRole('button', { name: /apply/i });
      await applyButton.click();
      
      // Wait for download
      await page.waitForLoadState('networkidle');
      
      // Check success message
      await expect(page.getByText(/exported.*product/i)).toBeVisible();
    });
  });

  test.describe('Product Deletion', () => {
    test('should archive product', async ({ page }) => {
      await page.goto('/admin/products');
      await page.waitForSelector('table');
      
      // Click actions menu on first product
      const actionsButton = page.getByRole('button', { name: /more/i }).first();
      await actionsButton.click();
      
      // Select archive
      const archiveOption = page.getByRole('menuitem', { name: /archive/i });
      await archiveOption.click();
      
      // Confirm in dialog
      const confirmButton = page.getByRole('button', { name: /archive/i }).last();
      await confirmButton.click();
      
      // Wait for update
      await page.waitForLoadState('networkidle');
      
      // Check success
      await expect(page.getByText(/product archived/i)).toBeVisible();
    });
  });
});
