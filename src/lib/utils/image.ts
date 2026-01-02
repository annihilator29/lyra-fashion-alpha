export const getStorageImageUrl = (path: string) => {
  // If complete URL, return as is
  if (path.startsWith('http')) return path;
  
  // Clean path
  const cleanPath = path.replace(/^\/?images\//, '');
  
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lyra-assets/images/${cleanPath}`;
};
