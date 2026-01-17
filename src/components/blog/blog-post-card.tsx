import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/database.types';
import { formatBlogDate } from '@/lib/blog/blog-utils';

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const categories = (post.categories as string[]) || [];

  return (
    <article className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      {/* Featured Image */}
      {post.featured_image && (
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
          <Image
            src={post.featured_image}
            alt={post.title}
            width={400}
            height={200}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="mb-3">
          <Link
            href={`/blog/${post.slug}`}
            className="font-playfair text-xl font-bold text-gray-900 transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-4 line-clamp-3 text-sm text-gray-600">
            {post.excerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {post.published_at && (
              <time dateTime={post.published_at}>
                {formatBlogDate(post.published_at)}
              </time>
            )}
            {post.reading_time && <span>{post.reading_time} min read</span>}
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="font-medium text-primary hover:underline"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
