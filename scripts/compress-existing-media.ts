import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import { getPayload } from 'payload';
import payloadConfig from '../src/payload.config.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  // Try loading from current directory as fallback
  dotenv.config();
}

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? `Found (${process.env.PAYLOAD_SECRET.substring(0, 10)}...)` : 'Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
console.log('GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID ? 'Found' : 'Missing');
console.log('Current working directory:', process.cwd());
console.log('Loading .env from:', path.resolve(__dirname, '../.env'));

// Ensure required environment variables are set
if (!process.env.PAYLOAD_SECRET) {
  console.error('PAYLOAD_SECRET environment variable is required');
  process.exit(1);
}

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCS_BUCKET || 'spherescout-cms-media';
const bucket = storage.bucket(bucketName);

async function compressExistingMedia() {
  try {
    // Initialize Payload
    const payload = await getPayload({ config: payloadConfig });

    console.log('Fetching all media files from database...');

    // Get all media files from the database
    const mediaFiles = await payload.find({
      collection: 'media',
      limit: 1000, // Adjust if you have more files
    });

    console.log(`Found ${mediaFiles.docs.length} media files to process`);

    // Create temp directory for processing
    const tempDir = './temp-media-processing';
    await fs.mkdir(tempDir, { recursive: true });

    let processedCount = 0;
    let errorCount = 0;

    for (const mediaDoc of mediaFiles.docs) {
      try {
        const filename = mediaDoc.filename;
        if (!filename) {
          console.log(`Skipping media doc with no filename`);
          continue;
        }

        console.log(`Processing ${filename} with new compression settings...`);

        // Download original file from GCS
        const file = bucket.file(filename);
        const [exists] = await file.exists();

        if (!exists) {
          console.log(`File ${filename} not found in GCS, skipping...`);
          continue;
        }

        const tempFilePath = path.join(tempDir, filename);
        await file.download({ destination: tempFilePath });

        // Create compressed WebP version (keep same filename if already WebP)
        const webpFilename = filename.endsWith('.webp') ? filename : filename.replace(/\.[^.]+$/, '.webp');
        const compressedPath = path.join(tempDir, `compressed-${webpFilename}`);

        await sharp(tempFilePath)
          .webp({
            quality: 85,
            lossless: false,
          })
          .toFile(compressedPath);

        // Upload compressed file to GCS
        await bucket.upload(compressedPath, {
          destination: webpFilename,
          metadata: {
            contentType: 'image/webp',
          },
        });

        // Get file stats for size update
        const stats = await fs.stat(compressedPath);

        // Update database record
        await payload.update({
          collection: 'media',
          id: mediaDoc.id,
          data: {
            filename: webpFilename,
            mimeType: 'image/webp',
            filesize: stats.size,
            url: `https://storage.googleapis.com/${bucketName}/${webpFilename}`,
          },
        });

        // For WebP files, we're replacing with recompressed version
        // No need to delete the old file since we're using the same filename

        // Clean up temp files
        await fs.unlink(tempFilePath).catch(() => {});
        await fs.unlink(compressedPath).catch(() => {});

        processedCount++;
        console.log(`✓ Processed ${filename} -> ${webpFilename} (${processedCount}/${mediaFiles.docs.length})`);

        // Add small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        console.error(`Error processing ${mediaDoc.filename}:`, error instanceof Error ? error.message : String(error));
      }
    }

    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    console.log(`\nCompression complete!`);
    console.log(`✓ Successfully processed: ${processedCount} files`);
    console.log(`✗ Errors: ${errorCount} files`);

  } catch (error) {
    console.error('Script failed:', error);
  }
}

// Run the script
compressExistingMedia();