/**
 * API Route: Upload Product Images
 * Story 7.2: Product Management Interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type UserRole = 'customer' | 'admin' | 'super_admin';

/**
 * Check if user is admin (for API routes)
 */
async function checkIsAdmin(request: NextRequest): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const role = user.user_metadata?.role as UserRole;
  return role === 'admin' || role === 'super_admin';
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${file.name}. Allowed: JPEG, PNG, WebP`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: `File too large: ${file.name}. Max: 5MB`,
          },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();
    const uploadedUrls: string[] = [];

    // Upload each file
    for (const file of files) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${uploadedUrls.length} image(s)`,
      data: { urls: uploadedUrls },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload images',
      },
      { status: 500 }
    );
  }
}
