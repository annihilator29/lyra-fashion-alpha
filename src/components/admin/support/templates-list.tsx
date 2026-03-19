'use client';

/**
 * Templates List Component
 * Story 7.4b: Support Ticket System — AC4
 *
 * Display canned response templates grouped by category with
 * create/edit/delete actions.
 */

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { deleteTemplate } from '@/app/admin/support/templates/actions';
import { TemplateEditor } from './template-editor';
import type { SupportTemplate, TemplateCategory } from '@/types/support';

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  shipping: '🚚 Shipping',
  returns: '↩ Returns',
  product: '🛍 Product',
  billing: '💳 Billing',
  general: '💬 General',
};

interface TemplatesListProps {
  initialTemplates: SupportTemplate[];
}

export function TemplatesList({ initialTemplates }: TemplatesListProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<SupportTemplate | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Group by category
  const grouped = Object.entries(CATEGORY_LABELS).map(([cat, label]) => ({
    category: cat as TemplateCategory,
    label,
    items: templates.filter((t) => t.category === cat),
  }));

  function handleDelete(templateId: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return;

    setDeletingId(templateId);
    startTransition(async () => {
      const result = await deleteTemplate(templateId);
      if (!result.error) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      }
      setDeletingId(null);
    });
  }

  function handleSaved(template: SupportTemplate) {
    setTemplates((prev) => {
      const exists = prev.find((t) => t.id === template.id);
      return exists
        ? prev.map((t) => (t.id === template.id ? template : t))
        : [template, ...prev];
    });
    setEditingTemplate(null);
    setShowCreate(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {templates.length} template{templates.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Create / Edit modal */}
      {(showCreate || editingTemplate) && (
        <TemplateEditor
          template={editingTemplate ?? undefined}
          onSaved={handleSaved}
          onCancel={() => {
            setEditingTemplate(null);
            setShowCreate(false);
          }}
        />
      )}

      {/* Categories */}
      {grouped.map(({ category, label, items }) =>
        items.length === 0 ? null : (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {label}
            </h3>
            <div className="space-y-2">
              {items.map((t) => (
                <Card key={t.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="py-3 px-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTemplate(t)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={isPending && deletingId === t.id}
                        onClick={() => handleDelete(t.id)}
                      >
                        {isPending && deletingId === t.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      )}

      {templates.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No templates yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setShowCreate(true)}
          >
            Create your first template
          </Button>
        </div>
      )}
    </div>
  );
}
