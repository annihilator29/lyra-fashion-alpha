import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth/roles';
import { Package, Clock, Search } from 'lucide-react';

interface Order {
  id: string;
  order_number?: string;
  customer_email: string | null;
  status: string;
  total: number;
  ordered_at: string;
  production_started_at: string | null;
  production_stages: {
    cutting?: { status: string };
    sewing?: { status: string };
    finishing?: { status: string };
    qc?: { status: string };
  } | null;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductionDashboard({ searchParams }: PageProps) {
  const supabase = await createClient();
  
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/login');
  }

  const params = await searchParams;
  const searchQuery = typeof params.search === 'string' ? params.search : '';

  // Build query
  let query = supabase
    .from('orders')
    .select('*')
    .in('status', ['production', 'quality_check'])
    .order('production_started_at', { ascending: false });

  // Apply search filter
  if (searchQuery) {
    query = query.or(`order_number.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
  }

  // Helper to get current stage
  function getCurrentStage(stages: Order['production_stages']): string {
    if (!stages) return 'Not Started';
    const stageOrder = ['cutting', 'sewing', 'finishing', 'qc'];
    for (const stage of stageOrder) {
      if (stages[stage as keyof typeof stages]?.status === 'in_progress') {
        return stage.charAt(0).toUpperCase() + stage.slice(1);
      }
    }
    return 'Completed';
  }

  // Helper to get stage progress percentage
  function getStageProgress(stages: Order['production_stages']): number {
    if (!stages) return 0;
    const stageOrder = ['cutting', 'sewing', 'finishing', 'qc'];
    let completed = 0;
    stageOrder.forEach(stage => {
      if (stages[stage as keyof typeof stages]?.status === 'completed') {
        completed++;
      }
    });
    return (completed / stageOrder.length) * 100;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage orders in production and quality check
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Orders: {orders?.length || 0}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Search by order number or email..."
              defaultValue={searchQuery}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Grid */}
      {orders && orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order: Order) => {
            const currentStage = getCurrentStage(order.production_stages);
            const progress = getStageProgress(order.production_stages);
            
            return (
              <Link
                key={order.id}
                href={`/admin/production/${order.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">
                        Order {order.order_number || order.id.slice(0, 8)}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'production' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.status === 'production' ? 'In Production' : 'Quality Check'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mt-4">
                      <div>
                        <span className="text-gray-500">Customer</span>
                        <p className="font-medium">{order.customer_email || 'Guest'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total</span>
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Ordered</span>
                        <p className="font-medium">
                          {new Date(order.ordered_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Production Progress</span>
                        <span className="font-medium">{currentStage}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      {order.production_started_at ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>
                            Started {new Date(order.production_started_at).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-yellow-600">Awaiting Start</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Orders in Production</h3>
          <p className="text-gray-500">
            There are currently no orders in production or quality check status.
          </p>
        </div>
      )}
    </div>
  );
}
