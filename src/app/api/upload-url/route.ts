import { s3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
export const runtime = "nodejs";

const bucket =
  process.env.S3_BUCKET_NAME ??
  process.env.AWS_S3_BUCKET_NAME ??
  process.env.AWS_BUCKET_NAME;

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function getPublicUrl(key: string) {
  const publicBaseUrl = process.env.AWS_PUBLIC_URL;
// If a public base URL is provided, construct the file URL using it. Otherwise, if an endpoint and bucket are provided, construct the URL in the format {endpoint}/{bucket}/{key}. If neither is available, return null.
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  if (endpoint && bucket) {
    return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  }

  return null;
}

export async function POST(request: Request) {
  if (!bucket) {
    return NextResponse.json(
      { error: "Missing S3_BUCKET_NAME environment variable." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as {
    fileName?: string;
    fileType?: string;
  };

  if (!body.fileName) {
    return NextResponse.json({ error: "fileName is required." }, { status: 400 });
  }

  const key = `uploads/${createId()}-${safeFileName(body.fileName)}`;
  const contentType = body.fileType || "application/octet-stream";

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return NextResponse.json({
    key,
    uploadUrl,
    fileUrl: getPublicUrl(key),
  });
}
