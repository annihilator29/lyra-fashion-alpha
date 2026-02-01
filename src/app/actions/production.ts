'use server';

/**
 * Production Stage Server Actions
 * Story 6.3 - Production Status Communication
 * 
 * Server actions for updating production stages and managing
 * production workflow transitions.
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductionStageName, ProductionStageStatus, ProductionStages } from '@/types/order';
import { requireAdmin } from '@/lib/auth/roles';

export interface ProductionStageUpdate {
  stage: ProductionStageName;
  status: ProductionStageStatus;
  timestamp?: string;
}

const stageOrder: ProductionStageName[] = ['cutting', 'sewing', 'finishing', 'qc'];

export interface ProductionUpdateResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Validate that a stage transition is allowed
 * Prevents invalid transitions (e.g., completing sewing before cutting)
 */
export async function validateStageTransition(
  currentStages: ProductionStages,
  targetStage: ProductionStageName,
  targetStatus: ProductionStageStatus
): Promise<{ valid: boolean; error?: string }> {
  const targetIndex = stageOrder.indexOf(targetStage);
  const stagesMap = currentStages as Record<ProductionStageName, { status: ProductionStageStatus; started_at?: string; completed_at?: string }>;
  
  // Check all previous stages are completed
  for (let i = 0; i < targetIndex; i++) {
    const prevStage = stageOrder[i];
    if (stagesMap[prevStage].status !== 'completed') {
      return {
        valid: false,
        error: `Cannot update ${targetStage} - ${prevStage} must be completed first`
      };
    }
  }
  
  // Check current stage status transition validity
  const currentStatus = stagesMap[targetStage].status;
  
  if (targetStatus === 'in_progress' && currentStatus !== 'not_started') {
    return {
      valid: false,
      error: `Cannot start ${targetStage} - current status is ${currentStatus}`
    };
  }
  
  if (targetStatus === 'completed' && currentStatus !== 'in_progress') {
    return {
      valid: false,
      error: `Cannot complete ${targetStage} - must be in_progress first`
    };
  }
  
  return { valid: true };
}

/**
 * Update a production stage for an order
 * Server Action - can be called from client components
 */
export async function updateProductionStageAction(
  orderId: string,
  update: ProductionStageUpdate
): Promise<ProductionUpdateResponse> {
  // Verify admin access
  await requireAdmin();
  
  const supabase = await createClient();
  
  try {
    // First, get current production stages
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('production_stages')
      .eq('id', orderId)
      .single();
    
    if (fetchError) {
      return { success: false, error: `Failed to fetch order: ${fetchError.message}` };
    }
    
    const currentStages: ProductionStages = order.production_stages || {
      cutting: { status: 'not_started' },
      sewing: { status: 'not_started' },
      finishing: { status: 'not_started' },
      qc: { status: 'not_started' }
    };
    
    // Validate the transition
    const validation = await validateStageTransition(currentStages, update.stage, update.status);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Build update object
    const timestamp = update.timestamp || new Date().toISOString();
    const updateData: Record<string, unknown> = {
      [`production_stages.${update.stage}.status`]: update.status,
      updated_at: new Date().toISOString()
    };
    
    if (update.status === 'in_progress') {
      updateData[`production_stages.${update.stage}.started_at`] = timestamp;
    } else if (update.status === 'completed') {
      updateData[`production_stages.${update.stage}.completed_at`] = timestamp;
      
      // If QC is completed, update order status to quality_check
      if (update.stage === 'qc') {
        updateData['status'] = 'quality_check';
        updateData['quality_checked_at'] = timestamp;
      }
    }
    
    // Perform the update
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: `Update failed: ${error.message}` };
    }
    
    // Revalidate the order detail page
    revalidatePath(`/admin/production/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
    
    return { success: true, data };
  } catch (error) {
    console.error('Production stage update failed:', error);
    return { success: false, error: 'Failed to update production stage. Please try again.' };
  }
}

/**
 * Update production completion estimate
 * Server Action
 */
export async function updateProductionCompletionEstimateAction(
  orderId: string,
  estimate: string
): Promise<ProductionUpdateResponse> {
  // Verify admin access
  await requireAdmin();
  
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        production_completion_estimate: estimate,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Revalidate pages
    revalidatePath(`/admin/production/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to update completion estimate:', error);
    return { success: false, error: 'Failed to update completion estimate' };
  }
}

/**
 * Upload QC photo for an order
 * Server Action - handles file upload and order update
 */
export async function uploadQCPhotoAction(
  orderId: string,
  formData: FormData
): Promise<ProductionUpdateResponse> {
  // Verify admin access
  await requireAdmin();
  
  const file = formData.get('file') as File;
  
  if (!file) {
    return { success: false, error: 'No file provided' };
  }
  
  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { success: false, error: 'File size must be less than 5MB' };
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'File must be JPG, PNG, or WEBP' };
  }
  
  try {
    // Use admin client for storage operations
    const supabase = createAdminClient();
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `qc-${orderId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('order-photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      });
    
    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('order-photos')
      .getPublicUrl(fileName);
    
    // Update order with photo URL using regular client
    const client = await createClient();
    const { error: updateError } = await client
      .from('orders')
      .update({ 
        qc_photo_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (updateError) {
      return { success: false, error: `Failed to update order: ${updateError.message}` };
    }
    
    // Revalidate pages
    revalidatePath(`/admin/production/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
    
    return { success: true, data: { url: publicUrl } };
  } catch (error) {
    console.error('QC photo upload failed:', error);
    return { success: false, error: 'Failed to upload QC photo' };
  }
}

/**
 * Initialize production stages for an order entering production
 */
export async function initializeProductionStages(): Promise<ProductionStages> {
  return {
    cutting: { status: 'not_started' },
    sewing: { status: 'not_started' },
    finishing: { status: 'not_started' },
    qc: { status: 'not_started' }
  };
}
