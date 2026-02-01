/**
 * Production Stage Mutations
 * Story 6.3 - Production Status Communication
 * 
 * Database operations for updating production stages and managing
 * production workflow transitions.
 */

import { createClient } from '@/lib/supabase/server';
import { ProductionStageName, ProductionStageStatus, ProductionStage } from '@/types/order';

export interface ProductionStageUpdate {
  stage: ProductionStageName;
  status: ProductionStageStatus;
  timestamp?: string;
}

export interface ProductionStages {
  cutting: { status: ProductionStageStatus; started_at?: string; completed_at?: string };
  sewing: { status: ProductionStageStatus; started_at?: string; completed_at?: string };
  finishing: { status: ProductionStageStatus; started_at?: string; completed_at?: string };
  qc: { status: ProductionStageStatus; started_at?: string; completed_at?: string };
}

const stageOrder: ProductionStageName[] = ['cutting', 'sewing', 'finishing', 'qc'];

/**
 * Validate that a stage transition is allowed
 * Prevents invalid transitions (e.g., completing sewing before cutting)
 */
export function validateStageTransition(
  currentStages: ProductionStages,
  targetStage: ProductionStageName,
  targetStatus: ProductionStageStatus
): { valid: boolean; error?: string } {
  const stagesMap = currentStages as Record<ProductionStageName, ProductionStage>;
  const targetIndex = stageOrder.indexOf(targetStage);
  
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
 * Includes validation and timestamp management
 */
export async function updateProductionStage(
  orderId: string,
  update: ProductionStageUpdate
): Promise<{ success: boolean; error?: string; data?: unknown }> {
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
    const validation = validateStageTransition(currentStages, update.stage, update.status);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Build update object
    const timestamp = update.timestamp || new Date().toISOString();
    const updateData: Record<string, unknown> = {
      [`production_stages.${update.stage}.status`]: update.status
    };
    
    if (update.status === 'in_progress') {
      updateData[`production_stages.${update.stage}.started_at`] = timestamp;
    } else if (update.status === 'completed') {
      updateData[`production_stages.${update.stage}.completed_at`] = timestamp;
    }
    
    // Perform the update
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'You are not authorized to update production status.' };
      }
      return { success: false, error: `Update failed: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Production stage update failed:', error);
    return { success: false, error: 'Failed to update production stage. Please try again.' };
  }
}

/**
 * Update production completion estimate
 */
export async function updateProductionCompletionEstimate(
  orderId: string,
  estimate: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase
      .from('orders')
      .update({ production_completion_estimate: estimate })
      .eq('id', orderId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update completion estimate:', error);
    return { success: false, error: 'Failed to update completion estimate' };
  }
}

/**
 * Upload QC photo and update order
 */
export async function uploadQCPhoto(
  orderId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  
  try {
    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' };
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'File must be JPG, PNG, or WEBP' };
    }
    
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
    
    // Update order with photo URL
    const { error: updateError } = await supabase
      .from('orders')
      .update({ qc_photo_url: publicUrl })
      .eq('id', orderId);
    
    if (updateError) {
      return { success: false, error: `Failed to update order: ${updateError.message}` };
    }
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('QC photo upload failed:', error);
    return { success: false, error: 'Failed to upload QC photo' };
  }
}

/**
 * Get all orders in production status
 */
export async function getOrdersInProduction(): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('status', 'production')
      .order('production_started_at', { ascending: false });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch orders in production:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

/**
 * Initialize production stages for an order entering production
 */
export function initializeProductionStages(): ProductionStages {
  return {
    cutting: { status: 'not_started' },
    sewing: { status: 'not_started' },
    finishing: { status: 'not_started' },
    qc: { status: 'not_started' }
  };
}
