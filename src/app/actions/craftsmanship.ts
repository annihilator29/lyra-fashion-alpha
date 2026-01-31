/**
 * Server Action for Saving Craftsmanship Content
 * 
 * Handles saving craftsmanship content to products with validation and error handling.
 * 
 * @module app/actions/craftsmanship
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { CraftsmanshipContentSchema } from '@/lib/craftsmanship/validation';
import type { CraftsmanshipContent } from '@/lib/craftsmanship/types';
import { z } from 'zod';

/**
 * Error type for craftsmanship action failures
 */
export type CraftsmanshipActionError =
  | { code: 'VALIDATION_ERROR'; details: { issues: { path: (string | number | symbol)[]; message: string }[] } }
  | { code: 'DATABASE_ERROR'; message: string }
  | { code: 'NOT_FOUND'; productId: string }
  | { code: 'UNAUTHORIZED' }
  | { code: 'PERMISSION_DENIED' }
  | { code: 'UNKNOWN_ERROR'; message: string };

/**
 * Success result type for craftsmanship action
 */
export type CraftsmanshipActionSuccess = {
  success: true;
  revalidatedPaths: string[];
  product: CraftsmanshipContent;
};

/**
 * Result union type
 */
export type CraftsmanshipActionResult = CraftsmanshipActionSuccess | { success: false; error: CraftsmanshipActionError };

/**
 * Save craftsmanship content for a product
 * 
 * @param productId - The product ID to update
 * @param content - The craftsmanship content to save
 * @returns Result indicating success or failure with error details
 */
export async function saveCraftsmanshipContent(
  productId: string,
  content: unknown
): Promise<CraftsmanshipActionResult> {
  try {
    // Validate input
    const validatedContent = CraftsmanshipContentSchema.parse(content);

    const supabase = await createClient();

    // ✅ SECURITY FIX: Check user authentication
    console.log('Checking user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth result:', { userId: user?.id, authError });

    if (authError) {
      console.error('Auth error:', authError);
    }

    if (!user) {
      console.log('No user found - returning UNAUTHORIZED');
      return {
        success: false,
        error: { code: 'UNAUTHORIZED' }
      };
    }

    // ✅ SECURITY FIX: Verify user has admin role using database function
    console.log('Checking admin role using is_admin() function...');
    
    // Call is_admin() function (no parameters - uses auth.uid() internally)
    const { data: isAdmin, error: adminCheckError } = await supabase
      .rpc('is_admin');

    console.log('is_admin result:', { isAdmin, adminCheckError });

    if (adminCheckError) {
      console.error('Error checking admin status:', adminCheckError);
      // Fallback to checking metadata directly
      const userRole = user.user_metadata?.role;
      const isAdminFallback = userRole === 'admin';
      console.log('Fallback admin check:', { userRole, isAdmin: isAdminFallback });
      
      if (!isAdminFallback) {
        return {
          success: false,
          error: { code: 'PERMISSION_DENIED' }
        };
      }
    } else if (!isAdmin) {
      console.log('User is not admin - returning PERMISSION_DENIED');
      return {
        success: false,
        error: { code: 'PERMISSION_DENIED' }
      };
    }

    console.log('Authorization passed, proceeding to save...');

    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', productId }
      };
    }

    // Update product with craftsmanship content
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        craftsmanship_content: validatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) {
      return {
        success: false,
        error: { code: 'DATABASE_ERROR', message: updateError.message }
      };
    }

    // Revalidate cache for affected paths
    const revalidatedPaths: string[] = [
      `/products/${productId}`,
      '/admin/products',
      `/admin/products/${productId}`,
    ];

    for (const path of revalidatedPaths) {
      revalidatePath(path);
    }

    return {
      success: true,
      revalidatedPaths,
      product: validatedContent
    };
  } catch (err) {
    console.error('Craftsmanship action error:', err);
    if (err instanceof z.ZodError) {
      // Serialize the ZodError for client-side consumption
      return {
        success: false,
        error: { 
          code: 'VALIDATION_ERROR', 
          details: { 
            issues: err.issues.map(issue => ({
              path: issue.path,
              message: issue.message
            }))
          } 
        }
      };
    }
    
    return {
      success: false,
      error: { 
        code: 'UNKNOWN_ERROR', 
        message: err instanceof Error ? err.message : 'Unexpected error occurred' 
      }
    };
  }
}

/**
 * Delete craftsmanship content from a product
 * Sets the craftsmanship_content field to NULL
 * 
 * @param productId - The product ID to update
 * @returns Result indicating success or failure with error details
 */
export async function deleteCraftsmanshipContent(
  productId: string
): Promise<CraftsmanshipActionResult> {
  try {
    const supabase = await createClient();

    // ✅ SECURITY FIX: Check user authentication
    console.log('Delete: Checking user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Delete: Auth error:', authError);
    }

    if (!user) {
      console.log('Delete: No user found - returning UNAUTHORIZED');
      return {
        success: false,
        error: { code: 'UNAUTHORIZED' }
      };
    }

    // ✅ SECURITY FIX: Verify user has admin role using database function
    console.log('Delete: Checking admin role using is_admin() function...');
    
    // Call is_admin() function (no parameters - uses auth.uid() internally)
    const { data: isAdmin, error: adminCheckError } = await supabase
      .rpc('is_admin');

    console.log('Delete: is_admin result:', { isAdmin, adminCheckError });

    if (adminCheckError) {
      console.error('Delete: Error checking admin status:', adminCheckError);
      // Fallback to checking metadata directly
      const userRole = user.user_metadata?.role;
      const isAdminFallback = userRole === 'admin';
      console.log('Delete: Fallback admin check:', { userRole, isAdmin: isAdminFallback });
      
      if (!isAdminFallback) {
        return {
          success: false,
          error: { code: 'PERMISSION_DENIED' }
        };
      }
    } else if (!isAdmin) {
      console.log('Delete: User is not admin - returning PERMISSION_DENIED');
      return {
        success: false,
        error: { code: 'PERMISSION_DENIED' }
      };
    }

    console.log('Delete: Authorization passed, proceeding...');

    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', productId }
      };
    }

    // Update product to remove craftsmanship content
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        craftsmanship_content: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) {
      return {
        success: false,
        error: { code: 'DATABASE_ERROR', message: updateError.message }
      };
    }

    // Revalidate cache for affected paths
    const revalidatedPaths: string[] = [
      `/products/${productId}`,
      '/admin/products',
      `/admin/products/${productId}`,
    ];

    for (const path of revalidatedPaths) {
      revalidatePath(path);
    }

    return {
      success: true,
      revalidatedPaths,
      product: {} as CraftsmanshipContent // Return empty object since content was deleted
    };
  } catch (err) {
    return {
      success: false,
      error: { 
        code: 'UNKNOWN_ERROR', 
        message: err instanceof Error ? err.message : 'Unexpected error occurred' 
      }
    };
  }
}

/**
 * Check if a product has craftsmanship content
 * 
 * @param productId - The product ID to check
 * @returns Object with hasCraftsmanship boolean
 */
export async function checkProductCraftsmanship(
  productId: string
): Promise<{ hasCraftsmanship: boolean }> {
  try {
    const supabase = await createClient();

    // ✅ SECURITY FIX: Check user authentication (read operations still need auth)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { hasCraftsmanship: false };
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('craftsmanship_content')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return { hasCraftsmanship: false };
    }

    return { hasCraftsmanship: product.craftsmanship_content !== null };
  } catch {
    return { hasCraftsmanship: false };
  }
}
