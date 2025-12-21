
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const IMAGES_DIR = path.resolve(process.cwd(), 'public/images');
const BUCKET_NAME = 'products';

async function uploadImages() {
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`Images directory not found at ${IMAGES_DIR}`);
        return;
    }

    const files = fs.readdirSync(IMAGES_DIR);

    console.log(`Found ${files.length} files in ${IMAGES_DIR}`);

    for (const file of files) {
        const filePath = path.join(IMAGES_DIR, file);
        const fileStats = fs.statSync(filePath);

        if (fileStats.isFile()) {
            const fileBuffer = fs.readFileSync(filePath);
            // Determine content type strictly based on extension for simplicity
            const ext = path.extname(file).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            if (ext === '.png') contentType = 'image/png';
            if (ext === '.webp') contentType = 'image/webp';

            console.log(`Uploading ${file}...`);

            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(file, fileBuffer, {
                    contentType,
                    upsert: true,
                });

            if (error) {
                console.error(`Failed to upload ${file}:`, error.message);
            } else {
                console.log(`Successfully uploaded ${file}`);
            }
        }
    }
    console.log('Upload complete.');
}

uploadImages().catch(console.error);
