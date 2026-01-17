import { getPostBySlug, getRelatedPosts } from '@/lib/blog/blog-api';
import { formatBlogDate } from '@/lib/blog/blog-utils';
import { BlogPostContent } from '@/components/blog/blog-post-content';
import { RelatedPosts } from '@/components/blog/related-posts';
import { SocialShare } from '@/components/blog/social-share';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} - Lyra Fashion Blog`,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.featured_image ? [post.featured_image] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: post.featured_image ? [post.featured_image] : [],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const categories = (post.categories as string[]) || [];
  const relatedPosts = await getRelatedPosts(post.id, categories, 3);

  return (
    <article className="container mx-auto px-4 py-12">
      {/* Header */}
      <header className="mx-auto mb-12 max-w-4xl">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-6 font-playfair text-4xl font-bold text-gray-900 md:text-5xl">
          {post.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {post.published_at && (
            <time dateTime={post.published_at}>
              {formatBlogDate(post.published_at)}
            </time>
          )}
          {post.reading_time && (
            <span>{post.reading_time} min read</span>
          )}
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mt-8 overflow-hidden rounded-lg">
            <Image
              src={post.featured_image}
              alt={post.title}
              width={800}
              height={400}
              className="h-auto w-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl">
        <BlogPostContent content={post.content} />
      </div>

      {/* Social Share */}
      <div className="mx-auto my-12 max-w-4xl border-y py-8">
        <SocialShare title={post.title} slug={post.slug} />
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mx-auto mt-16 max-w-6xl">
          <RelatedPosts posts={relatedPosts} />
        </div>
      )}
    </article>
  );
}
