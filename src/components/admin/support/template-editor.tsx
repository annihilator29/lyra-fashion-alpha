'use client';

/**
 * Template Editor Component
 * Story 7.4b: Support Ticket System — AC4
 *
 * Modal form for creating and editing canned response templates.
 * Supports placeholder preview ({{customer_name}}, {{order_number}}, {{support_agent}}).
 */

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, X, Eye, EyeOff } from 'lucide-react';
import { createTemplate, updateTemplate } from '@/app/admin/support/templates/actions';
import { type SupportTemplate, type TemplateCategory } from '@/types/support';
import { supportTemplateSchema, type SupportTemplateInput } from '@/lib/schemas/support';

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'returns', label: 'Returns' },
  { value: 'product', label: 'Product' },
  { value: 'billing', label: 'Billing' },
];

const PLACEHOLDER_VARS = [
  { token: '{{customer_name}}', sample: 'Alex' },
  { token: '{{order_number}}', sample: 'ORD-12345' },
  { token: '{{support_agent}}', sample: 'Lyra Support Team' },
];

function interpolate(text: string): string {
  let out = text;
  for (const { token, sample } of PLACEHOLDER_VARS) {
    out = out.replaceAll(token, sample);
  }
  return out;
}

interface TemplateEditorProps {
  template?: SupportTemplate;
  onSaved: (template: SupportTemplate) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSaved, onCancel }: TemplateEditorProps) {
  const isEdit = Boolean(template);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState<SupportTemplateInput>({
    title: template?.title ?? '',
    subject: template?.subject ?? '',
    body: template?.body ?? '',
    category: template?.category ?? 'general',
  });

  function set<K extends keyof SupportTemplateInput>(k: K, v: SupportTemplateInput[K]) {
    setForm((prev: any) => ({ ...prev, [k]: v }));
  }

  function handleSubmit() {
    startTransition(async () => {
      setError(null);

      const result = isEdit && template
        ? await updateTemplate(template.id, form)
        : await createTemplate(form);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Build a full SupportTemplate for the parent callback
      const saved: SupportTemplate = {
        id: (isEdit ? template!.id : (result as { data: { id: string } | null }).data?.id) ?? '',
        ...form,
        created_by: template?.created_by ?? null,
        created_at: template?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onSaved(saved);
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {isEdit ? 'Edit Template' : 'New Template'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="tmpl-title">Title</Label>
            <input
              id="tmpl-title"
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Order Delay Apology"
              className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="tmpl-category">Category</Label>
            <select
              id="tmpl-category"
              value={form.category}
              onChange={(e) => set('category', e.target.value as TemplateCategory)}
              className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="tmpl-subject">Email Subject</Label>
            <input
              id="tmpl-subject"
              type="text"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              placeholder="Re: Your order {{order_number}}"
              className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
            />
          </div>

          {/* Body + preview toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="tmpl-body">Body</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreview((p) => !p)}
              >
                {preview ? (
                  <><EyeOff className="h-3 w-3 mr-1" /> Edit</>
                ) : (
                  <><Eye className="h-3 w-3 mr-1" /> Preview</>
                )}
              </Button>
            </div>

            {preview ? (
              <div className="w-full min-h-[160px] px-3 py-2 border border-input rounded-md text-sm bg-muted/30 whitespace-pre-wrap">
                {interpolate(form.body) || <span className="text-muted-foreground">No content</span>}
              </div>
            ) : (
              <textarea
                id="tmpl-body"
                value={form.body}
                onChange={(e) => set('body', e.target.value)}
                rows={7}
                placeholder={`Hi {{customer_name}},\n\nThank you for reaching out...\n\n{{support_agent}}`}
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background resize-none"
              />
            )}

            <p className="text-xs text-muted-foreground mt-1">
              Placeholders: {PLACEHOLDER_VARS.map((p) => p.token).join(', ')}
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEdit ? 'Save Changes' : 'Create Template'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
