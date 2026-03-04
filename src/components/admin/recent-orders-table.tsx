/**
 * Recent Orders Table Component
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC1: Recent Orders Display
 */

'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatusSelect } from './order-status-select';
import type { Order } from '@/types/database.types';
import type { OrderStatus } from '@/types/order';
import { ORDER_STATUS_COLORS } from '@/lib/constants/status-colors';
import { STATUS_LABELS } from '@/lib/orders/status-transitions';

interface RecentOrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  isLoading?: boolean;
  sortColumn?: keyof Order | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: keyof Order) => void;
}

// Format currency from cents
const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Format relative time (e.g., "2 minutes ago")
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Get customer display name from order
const getCustomerName = (order: Order): string => {
  if (order.shipping_address && typeof order.shipping_address === 'object') {
    const addr = order.shipping_address as { name?: string };
    if (addr.name) return addr.name;
  }
  return order.customer_email || 'Guest';
};

// NOTE: Order Number Format
// The story specifies "ORD-001234" format, but the database schema uses UUIDs
// without a sequential order_number field. We display a shortened version of
// the order ID for readability. To implement sequential order numbers,
// a database migration would be needed to add an order_number column with
// a trigger to auto-generate sequential values (e.g., ORD-000001, ORD-000002).

// Status badge component
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const color = ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || '#9CA3AF';
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="outline"
      className="font-normal"
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}15`, // 15 hex = ~8% opacity
      }}
      data-testid={`status-badge-${status}`}
    >
      {label}
    </Badge>
  );
};

// Sortable header component
interface SortableHeaderProps {
  column: keyof Order;
  label: string;
  currentSort: keyof Order | null;
  direction: 'asc' | 'desc';
  onSort: ((column: keyof Order) => void) | undefined;
}

const SortableHeader = ({
  column,
  label,
  currentSort,
  direction,
  onSort,
}: SortableHeaderProps) => {
  const isActive = currentSort === column;

  if (!onSort) {
    return <TableHead>{label}</TableHead>;
  }

  return (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(column)}
        className="h-8 gap-1 px-2 font-medium"
      >
        {label}
        <ArrowUpDown
          className={cn(
            'h-3 w-3',
            isActive && 'text-primary',
            isActive && direction === 'desc' && 'rotate-180'
          )}
        />
      </Button>
    </TableHead>
  );
};

// Loading skeleton rows
const LoadingSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-24" />
          </div>
        </TableCell>
      </TableRow>
    ))}
  </>
);

export function RecentOrdersTable({
  orders,
  onStatusChange,
  isLoading = false,
  sortColumn,
  sortDirection = 'desc',
  onSort,
}: RecentOrdersTableProps) {
  const router = useRouter();

  const handleViewDetails = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <div
      className="rounded-md border"
      data-testid="recent-orders-table"
    >
      <div className="max-h-[500px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <SortableHeader
                column="id"
                label="Order #"
                currentSort={sortColumn || null}
                direction={sortDirection}
                onSort={onSort}
              />
              <TableHead>Customer</TableHead>
              <SortableHeader
                column="total"
                label="Total"
                currentSort={sortColumn || null}
                direction={sortDirection}
                onSort={onSort}
              />
              <TableHead>Status</TableHead>
              <SortableHeader
                column="created_at"
                label="Created"
                currentSort={sortColumn || null}
                direction={sortDirection}
                onSort={onSort}
              />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingSkeleton />
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No recent orders
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order, index) => (
                <TableRow
                  key={order.id}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    index % 2 === 1 && 'bg-muted/20' // Zebra striping
                  )}
                  data-testid={`order-row-${order.id}`}
                >
                  <TableCell className="font-medium">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{getCustomerName(order)}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status as OrderStatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatRelativeTime(order.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(order.id)}
                        title="View Details"
                        data-testid={`view-details-${order.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status as OrderStatus}
                        onChange={(status) => onStatusChange(order.id, status)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default RecentOrdersTable;
