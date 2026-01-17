import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/database.types';
import { formatBlogDate } from '@/lib/blog/blog-utils';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 font-playfair text-2xl font-bold text-gray-900">
        Related Posts
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
          >
            {post.featured_image && (
              <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  width={400}
                  height={160}
                  className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            )}

            <div className="p-4">
              <h3 className="mb-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-playfair text-lg font-bold text-gray-900 transition-colors hover:text-primary"
                >
                  {post.title}
                </Link>
              </h3>

              {post.excerpt && (
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                  {post.excerpt}
                </p>
              )}

              <div className="text-xs text-gray-500">
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {formatBlogDate(post.published_at)}
                  </time>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
