/**
 * Customer Management Server Actions
 * Story 7.4a: Customer Lookup & Profile
 * 
 * Comprehensive server actions for customer administration:
 * - Customer search by email, name, phone, order number
 * - Customer profile retrieval with order stats
 * - Customer order history with filtering
 * - RBAC protection (admin only)
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { revalidatePath } from 'next/cache';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CustomerFilters {
  segment?: 'VIP' | 'Regular' | 'New' | 'all';
  hasOrders?: boolean;
  dateJoinedFrom?: string;
  dateJoinedTo?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface CustomerSearchResult {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  order_count: number;
  lifetime_value: number;
  segment: 'VIP' | 'Regular' | 'New';
  last_order_date: string | null;
}

export interface CustomerProfileResult {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  role: string;
  preferences: any | null;
  email_preferences: any | null;
  lifetime_value: number;
  order_count: number;
  last_order_date: string | null;
  segment: 'VIP' | 'Regular' | 'New';
  addresses: Array<{
    id: string;
    name: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string | null;
    postal_code: string;
    country: string;
    phone: string | null;
    is_default: boolean;
  }>;
}

export interface OrderHistoryFilter {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderHistoryResult {
  id: string;
  order_number: string | null;
  created_at: string;
  status: string;
  total: number;
  items_count: number;
  payment_status: string;
}

export interface CustomerListResult {
  customers: CustomerSearchResult[];
  total: number;
  hasMore: boolean;
  error?: string;
}

export interface CustomerDetailResult {
  customer: CustomerProfileResult | null;
  error?: string;
}

export interface OrderHistoryListResult {
  orders: OrderHistoryResult[];
  total: number;
  hasMore: boolean;
  error?: string;
}

// ============================================================================
// Customer Search & Listing (AC1)
// ============================================================================

/**
 * Search customers by email, name, phone, or order number
 * AC1: Customer Search & Lookup
 */
export async function searchCustomers(
  query: string,
  filters: CustomerFilters = {},
  pagination: Pagination = { page: 1, limit: 25 }
): Promise<CustomerListResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Build base query
    let searchQuery = supabase
      .from('customers')
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        phone_number,
        created_at
      `,
        { count: 'exact' }
      );

    // Apply search filter if query provided
    if (query && query.trim().length > 0) {
      const sanitizedQuery = query.trim().replace(/[%_]/g, '\\$&');
      
      // Check if query might be an order number (starts with ORD or is numeric)
      const isPotentialOrderNumber = 
        sanitizedQuery.toUpperCase().startsWith('ORD') || 
        /^\d+$/.test(sanitizedQuery);

      if (isPotentialOrderNumber) {
        // Search for customers by order number
        // First, find orders matching the query
        const { data: matchingOrders } = await supabase
          .from('orders')
          .select('customer_id')
          .or(`order_number.ilike.%${sanitizedQuery}%,id.ilike.%${sanitizedQuery}%`);

        if (matchingOrders && matchingOrders.length > 0) {
          const customerIds = matchingOrders
            .map(o => o.customer_id)
            .filter((id): id is string => id !== null);
          
          if (customerIds.length > 0) {
            searchQuery = searchQuery.in('id', customerIds);
          } else {
            // No matching customers found
            return {
              customers: [],
              total: 0,
              hasMore: false,
            };
          }
        } else {
          // No matching orders found
          return {
            customers: [],
            total: 0,
            hasMore: false,
          };
        }
      } else {
        // Search by email, name, or phone
        searchQuery = searchQuery.or(
          `email.ilike.%${sanitizedQuery}%,first_name.ilike.%${sanitizedQuery}%,last_name.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%,phone_number.ilike.%${sanitizedQuery}%`
        );
      }
    }

    // Apply segment filter
    if (filters.segment && filters.segment !== 'all') {
      // Segment filtering requires order stats, so we'll filter after fetching
      // This is a limitation - for production, consider materialized views
    }

    // Apply hasOrders filter
    if (filters.hasOrders !== undefined) {
      // This also requires order stats, filter after fetching
    }

    // Apply date range filters
    if (filters.dateJoinedFrom) {
      searchQuery = searchQuery.gte('created_at', filters.dateJoinedFrom);
    }
    if (filters.dateJoinedTo) {
      const endDate = new Date(filters.dateJoinedTo);
      endDate.setDate(endDate.getDate() + 1);
      searchQuery = searchQuery.lte('created_at', endDate.toISOString());
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    searchQuery = searchQuery.range(from, to).order('created_at', { ascending: false });

    const { data: customers, error, count } = await searchQuery;

    if (error) {
      console.error('searchCustomers - Error:', JSON.stringify(error, null, 2));
      return { customers: [], total: 0, hasMore: false, error: error.message };
    }

    // Get order stats for each customer
    const customerIds = customers?.map(c => c.id) || [];
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_id, total, created_at')
      .in('customer_id', customerIds);

    // Aggregate stats
    const statsMap = new Map<
      string,
      { count: number; total: number; lastOrderDate: string | null }
    >();
    
    orders?.forEach(order => {
      const current = statsMap.get(order.customer_id!) || { 
        count: 0, 
        total: 0,
        lastOrderDate: null
      };
      
      const orderDate = order.created_at;
      const isNewer = !current.lastOrderDate || orderDate > current.lastOrderDate;
      
      statsMap.set(order.customer_id!, {
        count: current.count + 1,
        total: current.total + Number(order.total || 0),
        lastOrderDate: isNewer ? orderDate : current.lastOrderDate,
      });
    });

    // Merge stats and calculate segment
    const customersWithStats: CustomerSearchResult[] = customers?.map(customer => {
      const stats = statsMap.get(customer.id) || { count: 0, total: 0, lastOrderDate: null };
      
      // Determine segment
      let segment: 'VIP' | 'Regular' | 'New' = 'New';
      if (stats.count >= 10 && stats.total >= 50000) segment = 'VIP';
      else if (stats.count >= 3) segment = 'Regular';

      return {
        ...customer,
        first_name: customer.first_name,
        last_name: customer.last_name,
        order_count: stats.count,
        lifetime_value: stats.total,
        segment,
        last_order_date: stats.lastOrderDate,
      };
    }) || [];

    // Apply segment filter in-memory
    let filteredCustomers = customersWithStats;
    if (filters.segment && filters.segment !== 'all') {
      filteredCustomers = filteredCustomers.filter(c => c.segment === filters.segment);
    }

    // Apply hasOrders filter in-memory
    if (filters.hasOrders === true) {
      filteredCustomers = filteredCustomers.filter(c => c.order_count > 0);
    } else if (filters.hasOrders === false) {
      filteredCustomers = filteredCustomers.filter(c => c.order_count === 0);
    }

    return {
      customers: filteredCustomers,
      total: filteredCustomers.length,
      hasMore: from + pagination.limit < (count || filteredCustomers.length),
    };
  } catch (error) {
    console.error('searchCustomers - Catch Error:', JSON.stringify(error, null, 2));
    return {
      customers: [],
      total: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Failed to search customers',
    };
  }
}

// ============================================================================
// Customer Profile Retrieval (AC2, AC4)
// ============================================================================

/**
 * Get customer by ID with complete profile information
 * AC2: Customer Profile View, AC4: Customer Addresses & Preferences
 */
export async function getCustomerById(customerId: string): Promise<CustomerDetailResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Fetch customer profile
    const { data: profile, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error || !profile) {
      console.error('getCustomerById - Error:', JSON.stringify(error, null, 2));
      return { 
        customer: null, 
        error: error?.message || 'Customer not found' 
      };
    }

    // Fetch addresses
    const { data: addresses } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .eq('is_deleted', false)
      .order('is_default', { ascending: false });

    // Calculate lifetime value and order stats
    const { data: orders } = await supabase
      .from('orders')
      .select('total, status, created_at')
      .eq('customer_id', customerId);

    const lifetimeValue = orders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const orderCount = orders?.length || 0;
    
    const lastOrder = orders?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    // Determine segment
    let segment: 'VIP' | 'Regular' | 'New' = 'New';
    if (orderCount >= 10 && lifetimeValue >= 50000) segment = 'VIP';
    else if (orderCount >= 3) segment = 'Regular';

    return { 
      customer: { 
        ...profile,
        lifetime_value: lifetimeValue,
        order_count: orderCount,
        last_order_date: lastOrder?.created_at || null,
        segment,
        addresses: addresses || [],
      } as CustomerProfileResult, 
      error: null 
    };
  } catch (error) {
    console.error('getCustomerById - Catch Error:', JSON.stringify(error, null, 2));
    return {
      customer: null,
      error: error instanceof Error ? error.message : 'Failed to fetch customer',
    };
  }
}

// ============================================================================
// Customer Order History (AC3)
// ============================================================================

/**
 * Get customer's order history with filtering
 * AC3: Customer Order History
 */
export async function getCustomerOrderHistory(
  customerId: string,
  filters: OrderHistoryFilter = {},
  pagination: Pagination = { page: 1, limit: 25 }
): Promise<OrderHistoryListResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Build base query
    let query = supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        created_at,
        status,
        total,
        payment_status,
        order_items (
          id
        )
      `,
        { count: 'exact' }
      )
      .eq('customer_id', customerId);

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Apply date range filters
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lte('created_at', endDate.toISOString());
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('getCustomerOrderHistory - Error:', JSON.stringify(error, null, 2));
      return { orders: [], total: 0, hasMore: false, error: error.message };
    }

    // Transform orders to include items count
    const orderHistory: OrderHistoryResult[] = orders?.map(order => ({
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      status: order.status,
      total: order.total,
      items_count: order.order_items?.length || 0,
      payment_status: order.payment_status,
    })) || [];

    return {
      orders: orderHistory,
      total: count || 0,
      hasMore: from + pagination.limit < (count || orderHistory.length),
    };
  } catch (error) {
    console.error('getCustomerOrderHistory - Catch Error:', JSON.stringify(error, null, 2));
    return {
      orders: [],
      total: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order history',
    };
  }
}
