'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateInventory(formData: FormData) {
  try {
    // Verify admin access before proceeding
    await requireAdmin();

    const productId = formData.get('product_id') as string;
    const totalQty = parseInt(formData.get('total_quantity') as string, 10);
    const reservedQty = parseInt(formData.get('reserved_quantity') as string, 10);
    const threshold = parseInt(formData.get('low_stock_threshold') as string, 10);
    
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    if (isNaN(totalQty) || isNaN(reservedQty) || isNaN(threshold)) {
      throw new Error('Invalid quantity values');
    }
    
    const supabase = await createClient();
    
    // Update inventory
    const { data, error } = await supabase
      .from('inventory')
      .update({
        total_quantity: totalQty,
        reserved_quantity: reservedQty,
        low_stock_threshold: threshold,
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId)
      .select();
    
    if (error) {
      console.error('Supabase error updating inventory:', error);
      throw new Error(`Failed to update inventory: ${error.message}`);
    }
    
    console.log('Inventory updated successfully:', data);
    
    // Revalidate the inventory page to show updated data
    revalidatePath('/admin/inventory');
    revalidatePath(`/admin/products/${productId}/edit`);
    
    redirect('/admin/inventory');
  } catch (error) {
    console.error('Error in updateInventory action:', error);
    throw error;
  }
}
