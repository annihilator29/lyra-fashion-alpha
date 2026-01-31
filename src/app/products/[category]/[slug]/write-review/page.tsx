import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { verifyReviewToken } from '@/lib/reviews/tokens';
import { createClient } from '@/lib/supabase/server';
import { ReviewForm } from '@/components/reviews/review-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';

interface WriteReviewPageProps {
  params: Promise<{ category: string; slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

async function getProductById(productId: string) {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, images, category')
    .eq('id', productId)
    .single();
  
  return product;
}

async function checkExistingReview(orderId: string, productId: string) {
  const supabase = await createClient();
  const { data: existingReview } = await supabase
    .from('product_reviews')
    .select('id, status')
    .eq('order_id', orderId)
    .eq('product_id', productId)
    .maybeSingle();
  
  return existingReview;
}

async function checkOrderDelivered(orderId: string) {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from('orders')
    .select('status, delivered_at')
    .eq('id', orderId)
    .single();
  
  return order?.status === 'delivered' || order?.delivered_at !== null;
}

async function WriteReviewContent({ 
  slug, 
  token 
}: { 
  slug: string; 
  token: string 
}) {
  // Verify the token
  const tokenPayload = await verifyReviewToken(token);
  
  if (!tokenPayload) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-destructive">Invalid or Expired Link</CardTitle>
          <CardDescription>
            This review link is no longer valid. Review links expire after 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Get product details
  const product = await getProductById(tokenPayload.productId);
  
  if (!product) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-destructive">Product Not Found</CardTitle>
          <CardDescription>
            The product you are trying to review could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verify the slug matches the product
  if (product.slug !== slug) {
    // Redirect to correct URL
    redirect(`/products/${product.category}/${product.slug}/write-review?token=${encodeURIComponent(token)}`);
  }

  // Check if order is delivered
  const isDelivered = await checkOrderDelivered(tokenPayload.orderId);
  
  if (!isDelivered) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-amber-600">Order Not Yet Delivered</CardTitle>
          <CardDescription>
            You can only review products after they have been delivered. Please check back once your order has arrived.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
            <Package className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">Order #{tokenPayload.orderId.slice(-8)}</p>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href={`/products/${product.category}/${product.slug}`}>
              View Product
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check for existing review
  const existingReview = await checkExistingReview(tokenPayload.orderId, tokenPayload.productId);
  
  if (existingReview) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Review Already Submitted</CardTitle>
          <CardDescription>
            You have already submitted a review for this product.
            {existingReview.status === 'pending' && (
              <span className="mt-2 block text-amber-600">
                Your review is currently pending approval.
              </span>
            )}
            {existingReview.status === 'approved' && (
              <span className="mt-2 block text-green-600">
                Your review has been approved and published.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
            {product.images?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-16 w-16 rounded-md object-cover"
              />
            )}
            <div>
              <p className="font-medium">{product.name}</p>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href={`/products/${product.category}/${product.slug}`}>
              View Product
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with this product to help other customers make informed decisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReviewForm
          productId={tokenPayload.productId}
          productName={product.name}
          token={token}
          onSuccess={() => {
            // Client-side redirect after success
          }}
        />
      </CardContent>
    </Card>
  );
}

function WriteReviewSkeleton() {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default async function WriteReviewPage({ 
  params, 
  searchParams 
}: WriteReviewPageProps) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Product Review</h1>
      </div>

      <Suspense fallback={<WriteReviewSkeleton />}>
        <WriteReviewContent slug={slug} token={token} />
      </Suspense>
    </main>
  );
}
