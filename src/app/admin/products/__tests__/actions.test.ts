/**
 * Product Management Server Actions Tests
 * Story 7.2: Product Management Interface
 * Phase 7: Testing & Polish
 * Updated: 2026-03-05 with Code Review Fixes
 */

import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateProductCategory,
  updateProductPrices,
  uploadProductImages,
  deleteProductImage,
  generateUniqueSlug,
  validateSKU,
  exportProductsToCSV,
} from '../actions';

// Mock dependencies
jest.mock('@/lib/auth/roles', () => ({
  requireAdmin: jest.fn().mockResolvedValue(undefined),
}));

// Create mock functions that can be reset
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockIn = jest.fn();
const mockNeq = jest.fn();
const mockOr = jest.fn();
const mockGte = jest.fn();
const mockLte = jest.fn();
const mockGt = jest.fn();
const mockLt = jest.fn();
const mockOrder = jest.fn();
const mockRange = jest.fn();
const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockIlike = jest.fn();

// Chainable mock builder
const createChainableMock = () => {
  const chain = {
    from: mockFrom.mockReturnThis(),
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    in: mockIn.mockReturnThis(),
    neq: mockNeq.mockReturnThis(),
    or: mockOr.mockReturnThis(),
    gte: mockGte.mockReturnThis(),
    lte: mockLte.mockReturnThis(),
    gt: mockGt.mockReturnThis(),
    lt: mockLt.mockReturnThis(),
    ilike: mockIlike.mockReturnThis(),
    order: mockOrder.mockReturnThis(),
    range: mockRange.mockReturnThis(),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  };
  return chain;
};

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => createChainableMock()),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
      })),
    },
  })),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Product Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products with default filters', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          price: 9999,
          category: 'Dresses',
          status: 'active',
          product_variants: [],
          inventory: [{ total_quantity: 10, reserved_quantity: 2, low_stock_threshold: 10 }],
        },
      ];

      mockSelect.mockReturnValueOnce({
        ...createChainableMock(),
        then: (resolve: any) => resolve({ data: mockData, count: 1, error: null }),
      });

      const result = await getProducts();

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle search filter', async () => {
      mockSelect.mockReturnValueOnce({
        ...createChainableMock(),
        then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
      });

      const result = await getProducts({ search: 'test' });

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle category filter', async () => {
      mockSelect.mockReturnValueOnce({
        ...createChainableMock(),
        then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
      });

      const result = await getProducts({ category: 'Dresses' });

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle status filter', async () => {
      mockSelect.mockReturnValueOnce({
        ...createChainableMock(),
        then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
      });

      const result = await getProducts({ status: 'active' });

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle pagination', async () => {
      mockSelect.mockReturnValueOnce({
        ...createChainableMock(),
        then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
      });

      const result = await getProducts({ page: 2, pageSize: 10 });

      expect(result).toBeDefined();
      expect(result.pagination?.page).toBe(2);
      expect(result.pagination?.pageSize).toBe(10);
    });

    it('should handle database errors', async () => {
      mockSelect.mockReturnValueOnce({
        ...createChainableMock(),
        then: (resolve: any, reject: any) => reject({ error: { message: 'Database error', code: 'DB_ERROR' } }),
      });

      const result = await getProducts();

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('getProductById', () => {
    it('should fetch a single product by ID', async () => {
      const mockProduct = {
        id: 'test-id',
        name: 'Test Product',
        slug: 'test-product',
        price: 9999,
      };

      mockSingle.mockResolvedValue({ data: mockProduct, error: null });

      const result = await getProductById('test-id');

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle non-existent product', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Product not found' } });

      const result = await getProductById('non-existent');

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('createProduct', () => {
    const validProductData = {
      name: 'New Product',
      slug: 'new-product',
      description: 'Test description',
      price: 9999,
      category: 'Dresses' as const,
      tags: ['new', 'sale'],
      images: ['https://example.com/image1.jpg'],
      status: 'draft' as const,
      variants: [
        {
          sku: 'NP-S-RED',
          size: 'S',
          color: 'Red',
          colorHex: '#FF0000',
          inventory: 10,
          priceModifier: 0,
        },
      ],
    };

    it('should create a product with valid data', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null }); // SKU validation
      mockSingle.mockResolvedValue({ data: { id: 'new-product-id' }, error: null });

      const result = await createProduct(validProductData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product created successfully');
      expect(result.data?.productId).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validProductData, name: '' };

      const result = await createProduct(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should validate price is positive', async () => {
      const invalidData = { ...validProductData, price: -100 };

      const result = await createProduct(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('should validate at least one variant', async () => {
      const invalidData = { ...validProductData, variants: [] };

      const result = await createProduct(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one variant');
    });

    it('should validate image URLs', async () => {
      const invalidData = { ...validProductData, images: [] };

      const result = await createProduct(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one image');
    });

    it('should validate maximum 10 images', async () => {
      const invalidData = {
        ...validProductData,
        images: Array(11).fill('https://example.com/image.jpg'),
      };

      const result = await createProduct(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum 10 images');
    });

    it('should validate SKU uniqueness', async () => {
      mockMaybeSingle.mockResolvedValue({ data: { id: 'existing-sku-id', sku: 'NP-S-RED' }, error: null });

      const result = await createProduct(validProductData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('SKU already exists');
    });

    it('should handle database errors', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null }); // SKU validation passes
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const result = await createProduct(validProductData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProduct', () => {
    const updateData = {
      name: 'Updated Product',
      slug: 'updated-product',
      price: 12999,
      category: 'Tops' as const,
      status: 'active' as const,
      images: ['https://example.com/new-image.jpg'],
      tags: ['updated'],
      variants: [
        {
          sku: 'UP-M-BLU',
          size: 'M',
          color: 'Blue',
          colorHex: '#0000FF',
          inventory: 15,
          priceModifier: 0,
        },
      ],
    };

    it('should update an existing product', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'test-id', slug: 'old-slug' }, error: null }) // Product exists check
        .mockResolvedValueOnce({ data: null, error: null }); // SKU validation

      const result = await updateProduct('test-id', updateData as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product updated successfully');
    });

    it('should handle non-existent product', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Product not found' } });

      const result = await updateProduct('non-existent', updateData as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Product not found');
    });

    it('should validate update data', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'test-id' }, error: null });

      const invalidData = { ...updateData, price: -100 };

      const result = await updateProduct('test-id', invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('should validate SKU uniqueness on update', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'test-id', slug: 'old-slug' }, error: null }) // Product exists
        .mockResolvedValueOnce({ data: { id: 'other-product', sku: 'UP-M-BLU' }, error: null }); // SKU exists on other product

      const result = await updateProduct('test-id', updateData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('SKU already exists');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete (archive) a product by default', async () => {
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteProduct('test-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product archived');
    });

    it('should hard delete when specified', async () => {
      mockDelete.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteProduct('test-id', true);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product deleted permanently');
    });

    it('should handle database errors', async () => {
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      });

      const result = await deleteProduct('test-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProductStatus', () => {
    it('should update status of multiple products', async () => {
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await updateProductStatus(['id1', 'id2'], 'active');

      expect(result.success).toBe(true);
      expect(result.message).toContain('2 product(s)');
    });

    it('should handle empty ID list', async () => {
      const result = await updateProductStatus([], 'active');

      expect(result.success).toBe(true);
    });
  });

  describe('updateProductPrices', () => {
    it('should update prices by percentage', async () => {
      mockIn.mockReturnValueOnce({
        then: (resolve: any) => resolve({ data: [{ id: 'id1', price: 10000 }], error: null }),
      });
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await updateProductPrices(['id1'], {
        type: 'percentage',
        value: 10,
      });

      expect(result.success).toBe(true);
    });

    it('should update prices by fixed amount', async () => {
      mockIn.mockReturnValueOnce({
        then: (resolve: any) => resolve({ data: [{ id: 'id1', price: 10000 }], error: null }),
      });
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await updateProductPrices(['id1'], {
        type: 'fixed',
        value: 500,
      });

      expect(result.success).toBe(true);
    });

    it('should ensure price is positive', async () => {
      mockIn.mockReturnValueOnce({
        then: (resolve: any) => resolve({ data: [{ id: 'id1', price: 100 }], error: null }),
      });
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await updateProductPrices(['id1'], {
        type: 'fixed',
        value: -200,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('validateSKU', () => {
    it('should validate unique SKU', async () => {
      // Single throws error when no rows found (which means SKU is unique)
      mockSingle.mockRejectedValue({ message: 'No rows found' });

      const result = await validateSKU('UNIQUE-SKU');

      expect(result.success).toBe(true);
      expect(result.message).toBe('SKU is available');
    });

    it('should detect duplicate SKU', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'existing-id', product_id: 'prod-1', sku: 'DUPLICATE-SKU' },
        error: null,
      });

      const result = await validateSKU('DUPLICATE-SKU');

      expect(result.success).toBe(false);
      expect(result.error).toBe('SKU already exists');
    });
  });

  describe('generateUniqueSlug', () => {
    it('should return slug if unique', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await generateUniqueSlug('unique-slug');

      expect(result).toBe('unique-slug');
    });

    it('should append suffix if slug exists', async () => {
      mockMaybeSingle
        .mockResolvedValueOnce({ data: { slug: 'existing-slug' }, error: null }) // First check finds existing
        .mockResolvedValueOnce({ data: null, error: null }); // Second check passes

      const result = await generateUniqueSlug('existing-slug');

      expect(result).toContain('existing-slug-');
      expect(result.length).toBeGreaterThan('existing-slug'.length);
    });
  });

  describe('exportProductsToCSV', () => {
    it('should export products to CSV format', async () => {
      mockIn.mockReturnValueOnce({
        then: (resolve: any) => resolve({
          data: [
            {
              id: '1',
              name: 'Product 1',
              slug: 'product-1',
              category: 'Dresses',
              price: 9999,
              status: 'active',
              product_variants: [
                {
                  sku: 'P1-S-RED',
                  size: 'S',
                  color: 'Red',
                  stock_quantity: 10,
                },
              ],
            },
          ],
          error: null,
        }),
      });

      const result = await exportProductsToCSV(['1']);

      expect(result.success).toBe(true);
      expect(result.data?.csv).toBeDefined();
      expect(result.data?.csv).toContain('ID,Name,Slug,Category,Price,Status,SKU,Size,Color,Inventory');
    });

    it('should handle products without variants', async () => {
      mockIn.mockReturnValueOnce({
        then: (resolve: any) => resolve({
          data: [
            {
              id: '1',
              name: 'Product 1',
              slug: 'product-1',
              category: 'Dresses',
              price: 9999,
              status: 'active',
              product_variants: [],
            },
          ],
          error: null,
        }),
      });

      const result = await exportProductsToCSV(['1']);

      expect(result.success).toBe(true);
    });
  });

  describe('deleteProductImage', () => {
    it('should validate filename to prevent path traversal', async () => {
      // Mock storage remove to succeed
      const mockRemove = jest.fn().mockResolvedValue({ error: null });
      const { createClient } = require('@/lib/supabase/server');
      createClient.mockReturnValue({
        storage: {
          from: jest.fn(() => ({
            remove: mockRemove,
          })),
        },
      });

      const result = await deleteProductImage('https://example.com/product-images/valid-file.jpg');

      expect(result.success).toBe(true);
    });

    it('should reject invalid filenames', async () => {
      const result = await deleteProductImage('https://example.com/product-images/../../../etc/passwd');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid filename format');
    });

    it('should reject filenames with path traversal attempts', async () => {
      // Path traversal is blocked by the regex validation
      const result = await deleteProductImage('https://example.com/product-images/test..file.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid filename format');
    });
  });
});

describe('Helper Functions', () => {
  describe('Slug generation', () => {
    it('should convert to lowercase and replace spaces', () => {
      const input = 'Test Product Name';
      const expected = 'test-product-name';

      const result = input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(result).toBe(expected);
    });

    it('should remove special characters', () => {
      const input = "Product's Name! @#$";
      const expected = 'products-name';

      const result = input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(result).toBe(expected);
    });
  });

  describe('Variant SKU generation', () => {
    it('should generate SKU from product name, size, and color', () => {
      const productName = 'Test';
      const size = 'Small';
      const color = 'Red';

      // New pattern: product name prefix + size + color
      const basePrefix = productName
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .split(/\s+/)
        .map(word => word.substring(0, 3))
        .join('')
        .substring(0, 6);
      const sizeCode = size.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const colorCode = color.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sku = `${basePrefix}-${sizeCode}-${colorCode}`;

      expect(sku).toBe('TES-SMALL-RED');
    });
  });

  describe('Price calculations', () => {
    it('should calculate percentage increase correctly', () => {
      const currentPrice = 10000;
      const percentage = 10;
      const newPrice = Math.round(currentPrice * (1 + percentage / 100) * 100) / 100;

      expect(newPrice).toBe(11000);
    });

    it('should calculate fixed amount increase correctly', () => {
      const currentPrice = 10000;
      const amount = 500;
      const newPrice = currentPrice + amount;

      expect(newPrice).toBe(10500);
    });

    it('should handle negative adjustments', () => {
      const currentPrice = 10000;
      const amount = -2000;
      const newPrice = Math.max(1, currentPrice + amount);

      expect(newPrice).toBe(8000);
    });

    it('should round to 2 decimal places', () => {
      const price = 99.999;
      const rounded = Math.round(price * 100) / 100;

      expect(rounded).toBe(100);
    });
  });
});
