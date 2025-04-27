import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  forcePathStyle: true,
  region: process.env.REGION!,
  endpoint: `${process.env.ENDPOINT_URL!}/s3`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export const uploadImageToBucket = async (
  file: Express.Multer.File,
  bucket: string
) => {
  const key = `${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  await client.send(command);

  return `${process.env.ENDPOINT_URL}/object/public/${bucket}/${key}`;
};


export default client;
