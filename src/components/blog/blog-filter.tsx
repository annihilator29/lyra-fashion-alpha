import Link from 'next/link';
import { BlogCategory } from '@/lib/blog/blog-utils';

interface BlogFilterProps {
  categories: readonly BlogCategory[];
  currentCategory?: string;
}

export function BlogFilter({ categories, currentCategory }: BlogFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Filter by:</span>

      {/* All Posts */}
      <Link
        href="/blog"
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          !currentCategory
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Posts
      </Link>

      {/* Category Filters */}
      {categories.map((category) => (
        <Link
          key={category}
          href={`/blog?category=${encodeURIComponent(category)}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            currentCategory === category
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
