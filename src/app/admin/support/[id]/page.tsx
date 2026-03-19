/**
 * Admin Support Ticket Detail Page
 * Story 7.4b: Support Ticket System — AC1, AC2, AC3
 *
 * Route: /admin/support/[id]
 */

import { isAdmin } from '@/lib/auth/roles';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TicketDetail } from '@/components/admin/support/ticket-detail';
import { TicketReply } from '@/components/admin/support/ticket-reply';
import { getTicketById } from '@/app/admin/support/actions';
import { getTemplates } from '@/app/admin/support/templates/actions';

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const { ticket } = await getTicketById(id);
  return {
    title: ticket
      ? `${ticket.ticket_number} | Support | Lyra Admin`
      : 'Ticket Not Found | Lyra Admin',
  };
}

export default async function AdminTicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const admin = await isAdmin();
  if (!admin) redirect('/');

  const { id } = await params;
  const [{ ticket, messages, error }, { templates }] = await Promise.all([
    getTicketById(id),
    getTemplates(),
  ]);

  if (!ticket || error === 'Ticket not found') {
    notFound();
  }

  const customerEmail = ticket.customer?.email;

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/support">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support
          </Button>
        </Link>
      </div>

      {/* Ticket detail + sidebar */}
      <TicketDetail ticket={ticket} messages={messages} />

      {/* Reply composer */}
      <div className="mt-6">
        <TicketReply
          ticketId={ticket.id}
          customerId={ticket.customer_id}
          customerEmail={customerEmail}
          templates={templates}
        />
      </div>
    </div>
  );
}
