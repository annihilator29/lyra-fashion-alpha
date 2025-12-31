// Migration script to fix existing orders with null customer_id
// This script should be run once to update existing orders that were created
// before the user_id fix was implemented

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are not defined');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrdersWithNullCustomerId() {
  console.log('🔧 Starting migration to fix orders with null customer_id...');
  
  try {
    // Find all orders with null customer_id
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, customer_email, created_at')
      .is('customer_id', null)
      .neq('status', 'pending'); // Only fix completed orders
    
    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError.message);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('✅ No orders with null customer_id found. Migration not needed.');
      return;
    }
    
    console.log(`📋 Found ${orders.length} orders with null customer_id to fix...`);
    
    // For each order, try to find the user by email and update the customer_id
    for (const order of orders) {
      if (!order.customer_email) {
        console.warn(`⚠️  Order ${order.id} has no customer_email. Skipping.`);
        continue;
      }
      
      try {
        // Find user by email
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', order.customer_email)
          .single();
        
        if (userError || !user) {
          console.warn(`⚠️  No user found for email ${order.customer_email}. Order ${order.id} will remain with null customer_id.`);
          continue;
        }
        
        // Update the order with the user ID and ordered_at
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            customer_id: user.id,
            ordered_at: order.created_at || new Date().toISOString() // Set ordered_at to created_at for historical orders
          })
          .eq('id', order.id);
        
        if (updateError) {
          console.error(`❌ Error updating order ${order.id}:`, updateError.message);
        } else {
          console.log(`✅ Fixed order ${order.id} - set customer_id to ${user.id} and ordered_at to ${order.created_at}`);
        }
      } catch (error) {
        console.error(`❌ Error processing order ${order.id}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run the migration
fixOrdersWithNullCustomerId();