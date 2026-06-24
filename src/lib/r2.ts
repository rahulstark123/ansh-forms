import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const s3Enabled = !!(
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY &&
  process.env.S3_ENDPOINT
);

let s3Client: S3Client | null = null;
if (s3Enabled) {
  s3Client = new S3Client({
    region: process.env.S3_REGION || "ap-south-1",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
  });
}

export async function uploadFile(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const fileExtension = path.extname(fileName);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExtension}`;

  if (s3Client && s3Enabled) {
    const bucketName = process.env.S3_BUCKET_NAME || "ansh-forms";
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueName,
          Body: buffer,
          ContentType: contentType,
        })
      );
      // Construct R2 URL. Often follows pattern: endpoint/bucket/key
      const endpoint = process.env.S3_ENDPOINT || "";
      return `${endpoint}/${bucketName}/${uniqueName}`;
    } catch (error) {
      console.error("R2 Upload failed, falling back to local storage:", error);
    }
  }

  // Local storage fallback: Write to public/uploads
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${uniqueName}`;
  } catch (err) {
    console.error("Local file writing failed:", err);
    // Ultimate fallback: Base64 data URL
    const base64 = buffer.toString("base64");
    return `data:${contentType};base64,${base64}`;
  }
}
