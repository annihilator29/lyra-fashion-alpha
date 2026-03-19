'use client';

/**
 * Ticket Reply Component
 * Story 7.4b: Support Ticket System — AC2, AC3
 *
 * Compose a reply or internal note for a ticket.
 * Supports template selection and direct email send.
 */

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { addTicketMessage } from '@/app/admin/support/actions';
import { sendEmailToCustomer } from '@/app/admin/emails/actions';
import type { SupportTemplate } from '@/types/support';

interface TicketReplyProps {
  ticketId: string;
  customerId: string | null;
  customerEmail?: string;
  templates: SupportTemplate[];
}

export function TicketReply({
  ticketId,
  customerId,
  customerEmail,
  templates,
}: TicketReplyProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function applyTemplate(templateId: string) {
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setContent(tmpl.body);
      setSelectedTemplate(templateId);
    }
  }

  function handleSubmit() {
    if (!content.trim()) {
      setError('Message cannot be empty.');
      return;
    }

    startTransition(async () => {
      setError(null);
      setSuccess(false);

      // Add ticket message (or internal note)
      const msgResult = await addTicketMessage({
        ticketId,
        content,
        isInternal,
      });

      if (msgResult.error) {
        setError(msgResult.error);
        return;
      }

      // If "send email" toggled and customer exists, also send email
      if (sendEmail && customerId && customerEmail) {
        const emailResult = await sendEmailToCustomer({
          customerId,
          subject: 'An update from Lyra Fashion Support',
          body: content,
          replyToTicketId: ticketId,
        });

        if (emailResult.error) {
          setError(`Message saved but email failed: ${emailResult.error}`);
          return;
        }
      }

      setContent('');
      setSelectedTemplate('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {isInternal ? 'Add Internal Note' : 'Reply to Customer'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template selector */}
        {templates.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Use template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
            >
              <option value="">— Select template —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.category}] {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isInternal
              ? 'Internal note (not visible to customer)...'
              : 'Type your reply...'
          }
          rows={5}
          className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {/* Controls row */}
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="internal-toggle"
              checked={isInternal}
              onCheckedChange={setIsInternal}
            />
            <Label htmlFor="internal-toggle" className="text-sm">
              Internal note
            </Label>
          </div>

          {!isInternal && customerId && customerEmail && (
            <div className="flex items-center gap-2">
              <Switch
                id="email-toggle"
                checked={sendEmail}
                onCheckedChange={setSendEmail}
              />
              <Label htmlFor="email-toggle" className="text-sm">
                Send email to customer
              </Label>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            size="sm"
            className="ml-auto"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isInternal ? 'Save Note' : sendEmail ? 'Send Reply & Email' : 'Send Reply'}
          </Button>
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            {sendEmail ? 'Reply sent and email delivered.' : 'Message saved.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
