import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="mb-4 font-playfair text-4xl font-bold text-gray-900">
        Post Not Found
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        Sorry, we couldn&apos;t find the blog post you&apos;re looking for.
      </p>
      <Link
        href="/blog"
        className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
      >
        Back to Blog
      </Link>
    </div>
  );
}
