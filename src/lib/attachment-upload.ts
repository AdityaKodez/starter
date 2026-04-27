import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "@/lib/s3";

const bucket =
  process.env.S3_BUCKET_NAME ??
  process.env.AWS_S3_BUCKET_NAME ??
  process.env.AWS_BUCKET_NAME;

const endpoint = process.env.AWS_ENDPOINT_URL_S3;

export function getAttachmentBucket() {
  return bucket;
}

export function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export function getPublicUrl(storageKey: string) {
  const publicBaseUrl = process.env.AWS_PUBLIC_URL;

  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${storageKey}`;
  }

  if (endpoint && bucket) {
    return `${endpoint.replace(/\/$/, "")}/${bucket}/${storageKey}`;
  }

  return null;
}

export function getAttachmentStorageKey(input: {
  attachmentId: string;
  userId: string;
  fileName: string;
}) {
  return `mistake-attachments/${input.userId}/${input.attachmentId}-${safeFileName(
    input.fileName,
  )}`;
}

export async function createAttachmentUploadUrl(input: {
  storageKey: string;
  contentType: string;
}) {
  if (!bucket) {
    throw new Error("Missing S3_BUCKET_NAME environment variable.");
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: input.storageKey,
    ContentType: input.contentType,
  });

  return getSignedUrl(s3, command, { expiresIn: 300 });
}
