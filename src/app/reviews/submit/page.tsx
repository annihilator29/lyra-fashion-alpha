import { redirect, notFound } from 'next/navigation';
import { verifyReviewToken } from '@/lib/reviews/tokens';
import { createClient } from '@/lib/supabase/server';

interface SubmitReviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function SubmitReviewPage({ searchParams }: SubmitReviewPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/products');
  }

  // Verify the token
  const payload = await verifyReviewToken(token);

  if (!payload) {
    // Token is invalid or expired
    // We could show a nice error page here, but for now redirecting to a generic error or home is safer
    // Ideally, we redirect to a page that says "Link Expired"
    // For now, let's redirect to account orders as a fallback if they are logged in, or products
    redirect('/products');
  }

  const { productId } = payload;

  // Fetch product to get the slug
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('slug, category')
    .eq('id', productId)
    .single();

  if (!product) {
    notFound();
  }

  // Redirect to the actual write-review page
  redirect(`/products/${product.category}/${product.slug}/write-review?token=${encodeURIComponent(token)}`);
}
