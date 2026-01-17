import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin role
    const supabase = await createClient();
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer for sharp processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize main image: resize to max 1200px width, convert to WebP
    const optimizedImage = await sharp(buffer)
      .resize(1200, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate thumbnail: 400x400 cover, WebP format
    const thumbnail = await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();

    // Generate unique file names
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const baseFileName = `${timestamp}-${randomStr}`;

    // Create folder structure: {year}/{month}/ (bucket name already is 'blog-images')
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const basePath = `${year}/${month}`;

    const mainImagePath = `${basePath}/${baseFileName}.webp`;
    const thumbnailPath = `${basePath}/${baseFileName}-thumb.webp`;

    // Upload optimized main image
    const { error: mainImageError } = await supabase.storage
      .from('blog-images')
      .upload(mainImagePath, optimizedImage, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year
      });

    if (mainImageError) {
      console.error('Main image upload error:', mainImageError);
      return NextResponse.json(
        { error: 'Failed to upload main image' },
        { status: 500 }
      );
    }

    // Upload thumbnail
    const { error: thumbnailError } = await supabase.storage
      .from('blog-images')
      .upload(thumbnailPath, thumbnail, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year
      });

    if (thumbnailError) {
      console.error('Thumbnail upload error:', thumbnailError);
      // Don't fail the request if thumbnail fails, just log it
    }

    // Get public URLs
    const {
      data: { publicUrl: mainImageUrl },
    } = supabase.storage.from('blog-images').getPublicUrl(mainImagePath);

    const {
      data: { publicUrl: thumbnailUrl },
    } = supabase.storage.from('blog-images').getPublicUrl(thumbnailPath);

    return NextResponse.json({
      url: mainImageUrl,
      thumbnailUrl: thumbnailError ? null : thumbnailUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
