/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { loadEnvConfig } = require('@next/env');

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const BUCKET_NAME = 'lyra-assets';
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

async function uploadImages() {
  console.log('Starting image upload to Supabase Storage...');

  try {
    // Check if bucket exists, create if not (using service role)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const bucketExists = buckets.find((b) => b.name === BUCKET_NAME);
    if (!bucketExists) {
      console.log(`Creating bucket: ${BUCKET_NAME}`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (createError) throw createError;
    } else {
      console.log(`Bucket ${BUCKET_NAME} already exists.`);
    }

    // Read files
    const files = fs.readdirSync(IMAGES_DIR);
    const imageFiles = files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));

    console.log(`Found ${imageFiles.length} images to upload.`);

    for (const file of imageFiles) {
      const filePath = path.join(IMAGES_DIR, file);
      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';

      console.log(`Uploading ${file}...`);
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`images/${file}`, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        console.error(`Failed to upload ${file}:`, uploadError.message);
      } else {
        console.log(`Successfully uploaded ${file}`);
      }
    }

    console.log('Upload complete!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

uploadImages();
