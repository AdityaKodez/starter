import {
  createAttachmentUploadUrl,
  getAttachmentBucket,
  getPublicUrl,
  safeFileName,
} from "@/lib/attachment-upload";
import { createId } from "@paralleldrive/cuid2";
import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!getAttachmentBucket()) {
    return NextResponse.json(
      { error: "Missing S3_BUCKET_NAME environment variable." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      fileName?: string;
      fileType?: string;
    };

    if (!body.fileName) {
      return NextResponse.json(
        { error: "fileName is required." },
        { status: 400 },
      );
    }

    const key = `uploads/${createId()}-${safeFileName(body.fileName)}`;
    const contentType = body.fileType || "application/octet-stream";

    const uploadUrl = await createAttachmentUploadUrl({
      storageKey: key,
      contentType,
    });

    return NextResponse.json({
      key,
      uploadUrl,
      fileUrl: getPublicUrl(key),
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL." },
      { status: 500 },
    );
  }
}
