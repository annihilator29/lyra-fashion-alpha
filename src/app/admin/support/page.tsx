/**
 * Admin Support Tickets List Page
 * Story 7.4b: Support Ticket System — AC1
 *
 * Route: /admin/support
 */

import { isAdmin } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TicketsTable } from '@/components/admin/support/tickets-table';
import { getTickets } from '@/app/admin/support/actions';
import { ArrowLeft, LifeBuoy, Plus } from 'lucide-react';
import type { TicketFilters, TicketStatus, TicketPriority } from '@/types/support';

interface SupportPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    search?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: 'Support Tickets | Lyra Admin',
};

export default async function AdminSupportPage({ searchParams }: SupportPageProps) {
  const admin = await isAdmin();
  if (!admin) redirect('/');

  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);

  const filters: TicketFilters = {
    status: params.status as TicketStatus | undefined,
    priority: params.priority as TicketPriority | undefined,
    search: params.search,
  };

  const { tickets, total, hasMore, error } = await getTickets(filters, {
    page,
    limit: 25,
  });

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LifeBuoy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Support Tickets</h1>
              <p className="text-muted-foreground">{total} total ticket{total !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TicketFiltersForm currentParams={params} />

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive mb-4 bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Table */}
      <TicketsTable initialTickets={tickets} totalCount={total} />

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {hasMore
          ? `Showing ${tickets.length} of ${total} tickets.`
          : `Showing all ${tickets.length} tickets.`}
      </div>
    </div>
  );
}

function TicketFiltersForm({ currentParams }: { currentParams: Record<string, string | undefined> }) {
  return (
    <form className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          name="search"
          placeholder="Search by ticket number or subject..."
          defaultValue={currentParams.search ?? ''}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        />
      </div>

      <div className="w-[160px]">
        <select
          name="status"
          defaultValue={currentParams.status ?? ''}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="pending_customer">Pending Customer</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="w-[140px]">
        <select
          name="priority"
          defaultValue={currentParams.priority ?? ''}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <Button type="submit" size="sm">
        Apply Filters
      </Button>
      <Link href="/admin/support">
        <Button type="button" variant="ghost" size="sm">
          Clear
        </Button>
      </Link>
    </form>
  );
}
