import { getPublishedPosts, getPostsByCategory } from '@/lib/blog/blog-api';
import { BLOG_CATEGORIES } from '@/lib/blog/blog-utils';
import { BlogPostCard } from '@/components/blog/blog-post-card';
import { BlogPagination } from '@/components/blog/blog-pagination';
import { BlogFilter } from '@/components/blog/blog-filter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Lyra Fashion',
  description:
    'Explore craftsmanship stories, styling tips, factory insights, and quality guides from Lyra Fashion',
  openGraph: {
    title: 'Blog - Lyra Fashion',
    description: 'Craftsmanship stories and styling inspiration',
    type: 'website',
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const categoryParam = params.category;

  const pageSize = 12;

  // Fetch posts based on category filter
  const { posts, total } = categoryParam
    ? await getPostsByCategory(categoryParam, page, pageSize)
    : await getPublishedPosts(page, pageSize);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-playfair text-4xl font-bold text-gray-900 md:text-5xl">
          Blog
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Explore our stories of craftsmanship, sustainability, and styling
          inspiration
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <BlogFilter
          categories={BLOG_CATEGORIES}
          currentCategory={categoryParam}
        />
      </div>

      {/* Blog Posts Grid */}
      {posts.length > 0 ? (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12">
              <BlogPagination
                currentPage={page}
                totalPages={totalPages}
                category={categoryParam}
              />
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-600">
            {categoryParam
              ? `No posts found in "${categoryParam}" category.`
              : 'No blog posts yet. Check back soon!'}
          </p>
        </div>
      )}
    </div>
  );
}
