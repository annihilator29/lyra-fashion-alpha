/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, customer_email, email_sent, email_sent_at, email_error, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching order:', error.message);
    return;
  }

  console.log('Most recent order:');
  console.log(JSON.stringify(order, null, 2));
}

main().catch(console.error);
