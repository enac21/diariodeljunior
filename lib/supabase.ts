import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const accessKeyId = process.env.SUPABASE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.SUPABASE_SECRET_ACCESS_KEY;
    const bucket = process.env.SUPABASE_BUCKET;
    const endpoint = process.env.SUPABASE_S3_ENDPOINT;

    if (!accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('AWS credentials not configured');
    }

    s3Client = new S3Client({
      forcePathStyle: true,
      region: 'us-east-1',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return s3Client;
}

export async function uploadAvatar(buffer: Buffer, filename: string): Promise<string> {
  const client = getS3Client();
  const bucket = process.env.SUPABASE_BUCKET;
  const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: filename,
    Body: buffer,
    ContentType: 'image/png',
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await client.send(command);

  return `https://${supabaseProjectRef}.supabase.co/storage/v1/object/public/${bucket}/${filename}`;
}
