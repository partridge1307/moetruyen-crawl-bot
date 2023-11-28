import { S3Client } from '@aws-sdk/client-s3';

declare global {
  // eslint-disable-next-line no-unused-vars
  var cachedContabo: S3Client;
}

let client: S3Client;
if (process.env.NODE_ENV === 'production')
  client = new S3Client({
    endpoint: process.env.CB_URL_ENDPOINT,
    region: process.env.CB_REGION,
    credentials: {
      accessKeyId: process.env.CB_ACCESS_KEY,
      secretAccessKey: process.env.CB_SECRET_KEY,
    },
    forcePathStyle: true,
    maxAttempts: 5,
  });
else {
  const cachedContabo = globalThis as unknown as {
    contabo: S3Client;
  };

  if (!cachedContabo.contabo) {
    cachedContabo.contabo = new S3Client({
      endpoint: process.env.CB_URL_ENDPOINT,
      region: process.env.CB_REGION,
      credentials: {
        accessKeyId: process.env.CB_ACCESS_KEY,
        secretAccessKey: process.env.CB_SECRET_KEY,
      },
      forcePathStyle: true,
      maxAttempts: 5,
    });
  }
  client = cachedContabo.contabo;
}

export const contabo = client;
