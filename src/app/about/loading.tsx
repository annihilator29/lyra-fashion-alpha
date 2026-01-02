export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}
