'use client';

/**
 * Ticket Detail Component
 * Story 7.4b: Support Ticket System — AC1, AC2
 *
 * Renders ticket header, customer sidebar, and message thread.
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, User, Clock, Tag, AlertCircle } from 'lucide-react';
import { updateTicketStatus, assignTicket } from '@/app/admin/support/actions';
import type {
  SupportTicket,
  SupportTicketMessage,
  TicketStatus,
  TicketPriority,
} from '@/types/support';

// ============================================================
// Status / Priority labels
// ============================================================

const STATUS_OPTIONS: TicketStatus[] = [
  'open',
  'in_progress',
  'pending_customer',
  'resolved',
  'closed',
];

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: '🔴 Urgent',
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  pending_customer: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

// ============================================================
// Props
// ============================================================

interface TicketDetailProps {
  ticket: SupportTicket;
  messages: SupportTicketMessage[];
}

// ============================================================
// Component
// ============================================================

export function TicketDetail({ ticket, messages }: TicketDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [statusError, setStatusError] = useState<string | null>(null);

  const customer = ticket.customer;
  const customerName = customer?.first_name
    ? `${customer.first_name} ${customer.last_name ?? ''}`.trim()
    : customer?.name ?? 'Unknown';

  function handleStatusChange(newStatus: TicketStatus) {
    startTransition(async () => {
      const result = await updateTicketStatus({
        ticketId: ticket.id,
        status: newStatus,
      });
      if (result.error) setStatusError(result.error);
      else setStatusError(null);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main column — ticket + messages */}
      <div className="lg:col-span-2 space-y-6">
        {/* Ticket header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">
                  {ticket.ticket_number}
                </p>
                <CardTitle className="text-xl">{ticket.subject}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
                <Badge variant="outline">{PRIORITY_LABELS[ticket.priority]}</Badge>
              </div>
            </div>
          </CardHeader>
          {ticket.description && (
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Status error */}
        {statusError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            <AlertCircle className="h-4 w-4" />
            {statusError}
          </div>
        )}

        {/* Message thread */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Message Thread ({messages.length})
          </h3>

          {messages.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No messages yet.
              </CardContent>
            </Card>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Customer info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" /> Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {customer ? (
              <>
                <p className="font-medium">{customerName}</p>
                <p className="text-muted-foreground">{customer.email}</p>
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="inline-flex items-center gap-1 text-primary text-xs mt-2 hover:underline"
                >
                  View profile <ExternalLink className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">No customer linked</p>
            )}
          </CardContent>
        </Card>

        {/* Ticket metadata */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" /> Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <select
                value={ticket.status}
                disabled={isPending}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full px-2 py-1.5 border border-input rounded-md text-sm bg-background disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground">Priority</p>
              <p className="font-medium mt-0.5">{PRIORITY_LABELS[ticket.priority]}</p>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Opened
              </p>
              <p className="mt-0.5">
                {new Date(ticket.created_at).toLocaleDateString('en-US', {
                  dateStyle: 'medium',
                })}
              </p>
            </div>

            {ticket.resolved_at && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                  <p className="mt-0.5">
                    {new Date(ticket.resolved_at).toLocaleDateString('en-US', {
                      dateStyle: 'medium',
                    })}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Message Bubble
// ============================================================

function MessageBubble({ message }: { message: SupportTicketMessage }) {
  const isAdmin = message.sender_type === 'admin';
  const isSystem = message.sender_type === 'system';
  const isInternal = message.is_internal;

  return (
    <div
      className={`rounded-lg p-4 text-sm border ${
        isSystem
          ? 'bg-muted/50 border-dashed text-muted-foreground italic'
          : isInternal
          ? 'bg-amber-50 border-amber-200'
          : isAdmin
          ? 'bg-primary/5 border-primary/10'
          : 'bg-background border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">
          {isSystem ? '⚙ System' : isAdmin ? '👤 Admin' : '👤 Customer'}
          {isInternal && (
            <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
              Internal
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(message.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      </div>
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}
