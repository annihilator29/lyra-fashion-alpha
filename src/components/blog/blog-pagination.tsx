import Link from 'next/link';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string;
}

export function BlogPagination({
  currentPage,
  totalPages,
  category,
}: BlogPaginationProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (category) {
      params.set('category', category);
    }
    return `/blog?${params.toString()}`;
  };

  const pages = [];
  const maxVisiblePages = 7;

  // Calculate page range to display
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Blog pagination"
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
          Previous
        </span>
      )}

      {/* First page + ellipsis */}
      {startPage > 1 && (
        <>
          <Link
            href={buildUrl(1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            1
          </Link>
          {startPage > 2 && <span className="px-2 text-gray-500">…</span>}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((page) => (
        <Link
          key={page}
          href={buildUrl(page)}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            page === currentPage
              ? 'bg-primary text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}

      {/* Last page + ellipsis */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-500">…</span>
          )}
          <Link
            href={buildUrl(totalPages)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
          Next
        </span>
      )}
    </nav>
  );
}
