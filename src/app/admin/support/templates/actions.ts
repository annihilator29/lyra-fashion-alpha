/**
 * Support Template Server Actions
 * Story 7.4b: Support Ticket System
 *
 * CRUD for canned response templates with category filtering.
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { revalidatePath } from 'next/cache';
import {
  supportTemplateSchema,
  type SupportTemplateInput,
} from '@/lib/schemas/support';
import type {
  TemplateListResult,
  ActionResult,
  SupportTemplate,
  TemplateCategory,
} from '@/types/support';

// ============================================================
// Query Templates (AC4)
// ============================================================

/**
 * Get all templates, optionally filtered by category.
 */
export async function getTemplates(
  category?: TemplateCategory
): Promise<TemplateListResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient() as any;

    let query = supabase
      .from('support_templates')
      .select('*', { count: 'exact' })
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('getTemplates - Error:', error);
      return { templates: [], total: 0, error: error.message };
    }

    return {
      templates: (data ?? []) as SupportTemplate[],
      total: count ?? 0,
    };
  } catch (err) {
    console.error('getTemplates - Catch:', err);
    return {
      templates: [],
      total: 0,
      error: err instanceof Error ? err.message : 'Failed to fetch templates',
    };
  }
}

/**
 * Get a single template by ID.
 */
export async function getTemplateById(
  templateId: string
): Promise<ActionResult<SupportTemplate | null>> {
  try {
    await requireAdmin();
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('support_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error || !data) {
      return { data: null, error: error?.message ?? 'Template not found' };
    }

    return { data: data as SupportTemplate };
  } catch (err) {
    console.error('getTemplateById - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch template',
    };
  }
}

// ============================================================
// Mutate Templates (AC4)
// ============================================================

/**
 * Create a new canned response template.
 */
export async function createTemplate(
  input: SupportTemplateInput
): Promise<ActionResult<{ id: string } | null>> {
  try {
    await requireAdmin();

    const parsed = supportTemplateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues.map((e) => e.message).join(', '),
      };
    }

    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('support_templates')
      .insert(parsed.data)
      .select('id')
      .single();

    if (error) {
      console.error('createTemplate - Error:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/admin/support/templates');
    return { data };
  } catch (err) {
    console.error('createTemplate - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create template',
    };
  }
}

/**
 * Update an existing template.
 */
export async function updateTemplate(
  templateId: string,
  input: SupportTemplateInput
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    const parsed = supportTemplateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues.map((e) => e.message).join(', '),
      };
    }

    const supabase = createAdminClient() as any;

    const { error } = await supabase
      .from('support_templates')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', templateId);

    if (error) {
      console.error('updateTemplate - Error:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/admin/support/templates');
    return { data: null };
  } catch (err) {
    console.error('updateTemplate - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update template',
    };
  }
}

/**
 * Delete a template.
 */
export async function deleteTemplate(
  templateId: string
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    if (!templateId) {
      return { data: null, error: 'Template ID is required' };
    }

    const supabase = createAdminClient() as any;

    const { error } = await supabase
      .from('support_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('deleteTemplate - Error:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/admin/support/templates');
    return { data: null };
  } catch (err) {
    console.error('deleteTemplate - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to delete template',
    };
  }
}
