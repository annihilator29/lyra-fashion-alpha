/**
 * Order Filters Component
 * Story 7.3: Order Management & Fulfillment Tools
 * AC1: Order Listing View, AC7: Order Search & Filters
 */

'use client';

import * as React from 'react';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterState {
  status: string;
  paymentStatus: string;
  dateFrom: string | undefined;
  dateTo: string | undefined;
  search: string;
}

const QUICK_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateRangeOpen, setDateRangeOpen] = React.useState(false);

  // Initialize filters from URL search params
  const [filters, setFilters] = React.useState<FilterState>({
    status: searchParams.get('status') || 'all',
    paymentStatus: searchParams.get('paymentStatus') || 'all',
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    search: searchParams.get('search') || '',
  });

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.paymentStatus !== 'all' ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.search
    );
  }, [filters]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.paymentStatus !== 'all') params.set('paymentStatus', filters.paymentStatus);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.search) params.set('search', filters.search);
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      search: '',
    });
    router.push('/admin/orders');
  };

  const handleQuickRange = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    setFilters((prev) => ({
      ...prev,
      dateFrom: format(from, 'yyyy-MM-dd'),
      dateTo: format(to, 'yyyy-MM-dd'),
    }));
    setDateRangeOpen(false);
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.paymentStatus !== 'all') count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Main Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[250px]">
          <Label htmlFor="search" className="text-xs mb-1.5">
            Search
          </Label>
          <Input
            id="search"
            placeholder="Order #, customer name, or email"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            className="h-10"
          />
        </div>

        {/* Status Filter */}
        <div className="w-[180px]">
          <Label htmlFor="status" className="text-xs mb-1.5">
            Order Status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger id="status" className="h-10">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="production">In Production</SelectItem>
              <SelectItem value="quality_check">Quality Check</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status Filter */}
        <div className="w-[180px]">
          <Label htmlFor="payment" className="text-xs mb-1.5">
            Payment Status
          </Label>
          <Select
            value={filters.paymentStatus}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, paymentStatus: value }))
            }
          >
            <SelectTrigger id="payment" className="h-10">
              <SelectValue placeholder="All payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="w-[200px]">
          <Label className="text-xs mb-1.5">Date Range</Label>
          <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full h-10 justify-start text-left font-normal',
                  !filters.dateFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? (
                  filters.dateTo ? (
                    <>
                      {format(new Date(filters.dateFrom), 'MMM d, yyyy')} -{' '}
                      {format(new Date(filters.dateTo), 'MMM d, yyyy')}
                    </>
                  ) : (
                    format(new Date(filters.dateFrom), 'MMM d, yyyy')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-3">
                {/* Quick Ranges */}
                <div className="flex flex-wrap gap-2">
                  {QUICK_RANGES.map((range) => (
                    <Badge
                      key={range.days}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleQuickRange(range.days)}
                    >
                      {range.label}
                    </Badge>
                  ))}
                </div>

                {/* Calendar */}
                <div className="flex gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">From</Label>
                    <Calendar
                      mode="single"
                      selected={
                        filters.dateFrom
                          ? new Date(filters.dateFrom)
                          : undefined
                      }
                      onSelect={(date) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateFrom: date ? format(date, 'yyyy-MM-dd') : undefined,
                        }))
                      }
                      initialFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">To</Label>
                    <Calendar
                      mode="single"
                      selected={
                        filters.dateTo ? new Date(filters.dateTo) : undefined
                      }
                      onSelect={(date) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateTo: date ? format(date, 'yyyy-MM-dd') : undefined,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <Button onClick={handleApplyFilters} className="h-10">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleReset} className="h-10">
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {filters.status !== 'all' && (
            <Badge variant="secondary">Status: {filters.status}</Badge>
          )}
          {filters.paymentStatus !== 'all' && (
            <Badge variant="secondary">Payment: {filters.paymentStatus}</Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary">
              Date: {filters.dateFrom || 'Start'} - {filters.dateTo || 'Now'}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleReset}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
