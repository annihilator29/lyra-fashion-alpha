import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateReadingTime } from '@/lib/blog/blog-utils';
import { isAdmin } from '@/lib/auth/roles';
import { deleteBlogImage, extractFilePathFromUrl } from '@/lib/supabase/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status,
      categories,
      tags,
    } = body;

    // Calculate reading time
    const reading_time = calculateReadingTime(content);

    // Get current post to check if status changed
    const { data: currentPost } = await supabase
      .from('blog_posts')
      .select('status, featured_image')
      .eq('id', id)
      .single();

    // Set published_at when changing from draft to published
    let published_at = null;
    if (status === 'published' && currentPost?.status === 'draft') {
      published_at = new Date().toISOString();
    }

    // Cleanup old featured image if it's being replaced
    if (
      currentPost?.featured_image &&
      featured_image &&
      currentPost.featured_image !== featured_image
    ) {
      const oldImagePath = extractFilePathFromUrl(currentPost.featured_image);
      if (oldImagePath) {
        await deleteBlogImage(oldImagePath);
        // Also try to delete thumbnail
        const thumbnailPath = oldImagePath.replace('.webp', '-thumb.webp');
        await deleteBlogImage(thumbnailPath);
      }
    }

    const updateData: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status,
      categories,
      tags: tags || [],
      reading_time,
      updated_at: new Date().toISOString(),
    };

    // Only update published_at if it's being set
    if (published_at) {
      updateData.published_at = published_at;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to update post',
          details: error.message,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get post to retrieve featured image path before deletion
    const { data: post } = await supabase
      .from('blog_posts')
      .select('featured_image')
      .eq('id', id)
      .single();

    // Delete the post
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to delete post',
          details: error.message,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    // Cleanup orphaned featured image after successful deletion
    if (post?.featured_image) {
      const imagePath = extractFilePathFromUrl(post.featured_image);
      if (imagePath) {
        await deleteBlogImage(imagePath);
        // Also try to delete thumbnail
        const thumbnailPath = imagePath.replace('.webp', '-thumb.webp');
        await deleteBlogImage(thumbnailPath);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
