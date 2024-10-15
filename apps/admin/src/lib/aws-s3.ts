import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const uploadImage = async (file: File, folder: string) => {
  // Convert file to WebP format
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const webpBuffer = await sharp(fileBuffer).webp().toBuffer();

  const key = `${folder}/${file.name.replaceAll(" ", "-")?.split(".").slice(0, -1).join(".")}.webp`;

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: key,
    Body: webpBuffer,
    ContentType: "image/webp",
  });

  try {
    await s3Client.send(uploadCommand);
    return key;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
