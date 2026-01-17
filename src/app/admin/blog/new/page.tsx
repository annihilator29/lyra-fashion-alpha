import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { BlogPostForm } from '@/components/admin/blog-post-form';

export default async function NewBlogPostPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin/blog/new');
  }

  // Check admin role
  const admin = await isAdmin();
  if (!admin) {
    redirect('/account/dashboard');
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">
          Write and publish a new blog post
        </p>
      </div>

      <BlogPostForm />
    </div>
  );
}
