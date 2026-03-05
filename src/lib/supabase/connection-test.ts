/**
 * Supabase Connection Test Utility
 * Story 7.2: Product Management Interface
 * Diagnostic tool to verify Supabase backend connectivity
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface ConnectionTestResult {
  success: boolean;
  timestamp: string;
  tests: {
    clientCreation: boolean;
    adminClientCreation: boolean;
    productsTable: boolean;
    productVariantsTable: boolean;
    inventoryTable: boolean;
    storageBucket: boolean;
  };
  errors: string[];
  data: {
    productCount?: number;
    variantCount?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sampleProduct?: any;
  };
}

/**
 * Test Supabase backend connection and data availability
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const result: ConnectionTestResult = {
    success: true,
    timestamp: new Date().toISOString(),
    tests: {
      clientCreation: false,
      adminClientCreation: false,
      productsTable: false,
      productVariantsTable: false,
      inventoryTable: false,
      storageBucket: false,
    },
    errors: [],
    data: {},
  };

  try {
    // Test 1: Create regular client
    try {
      const client = await createClient();
      if (client) {
        result.tests.clientCreation = true;
      } else {
        throw new Error('Client creation returned null');
      }
    } catch (error) {
      result.tests.clientCreation = false;
      result.errors.push(`Client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }

    // Test 2: Create admin client
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        result.tests.adminClientCreation = true;
      } else {
        throw new Error('Admin client creation returned null');
      }
    } catch (error) {
      result.tests.adminClientCreation = false;
      result.errors.push(`Admin client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }

    // Test 3: Query products table
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, images', { count: 'exact', head: false })
        .limit(5);

      if (error) {
        throw new Error(`Products query failed: ${error.message}`);
      }

      result.tests.productsTable = true;
      result.data.productCount = data?.length || 0;
      result.data.sampleProduct = data?.[0] || null;
    } catch (error) {
      result.tests.productsTable = false;
      result.errors.push(`Products table query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }

    // Test 4: Query product_variants table
    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('product_variants')
        .select('id, sku', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        throw new Error(`Variants query failed: ${error.message}`);
      }

      result.tests.productVariantsTable = true;
    } catch (error) {
      result.tests.productVariantsTable = false;
      result.errors.push(`Product variants table query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }

    // Test 5: Query inventory table
    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('inventory')
        .select('id, total_quantity', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        throw new Error(`Inventory query failed: ${error.message}`);
      }

      result.tests.inventoryTable = true;
    } catch (error) {
      result.tests.inventoryTable = false;
      result.errors.push(`Inventory table query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }

    // Test 6: Check storage bucket
    try {
      const supabase = await createClient();
      const { error } = await supabase.storage
        .from('product-images')
        .list('', { limit: 1 });

      if (error) {
        throw new Error(`Storage bucket access failed: ${error.message}`);
      }

      result.tests.storageBucket = true;
    } catch (error) {
      result.tests.storageBucket = false;
      result.errors.push(`Storage bucket check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Get sample products for debugging
 */
export async function getSampleProducts(limit = 3) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(limit);

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, error: null, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}
