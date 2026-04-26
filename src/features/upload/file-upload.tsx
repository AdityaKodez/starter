"use client";

import { IconFolderOpenFilled, IconUpload, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { toast } from "sonner";
import { BsArrowDownCircleFill, BsArrowUpCircleFill } from "react-icons/bs";

type PresignedUpload = {
  key: string;
  uploadUrl: string;
  fileUrl: string | null;
};

type UploadStatus = "pending" | "uploading" | "complete" | "failed";

type UploadItem = {
  id: string;
  name: string;
  type: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  previewUrl: string | null;
  upload?: PresignedUpload;
};

function getUploadId(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function createUploadItem(file: File): UploadItem {
  return {
    id: getUploadId(file),
    name: file.name,
    type: file.type,
    file,
    progress: 0,
    status: "pending",
    previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
  };
}

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  const INITIAL_DISPLAY_COUNT = 3;
  function revokePreviewUrls(currentUploads: UploadItem[]) {
    currentUploads.forEach((upload) => {
      if (upload.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(upload.previewUrl);
      }
    });
  }

  function updateSelectedFiles(files: File[]) {
    setUploads((currentUploads) => {
      const existingIds = new Set(currentUploads.map((upload) => upload.id));
      const nextUploads = [...currentUploads];

      files.forEach((file) => {
        const nextId = getUploadId(file);

        if (!existingIds.has(nextId)) {
          nextUploads.push(createUploadItem(file));
          existingIds.add(nextId);
        }
      });

      return nextUploads;
    });
  }

  async function createUploadUrl(file: File) {
    const response = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Could not create upload URL.");
    }

    return data as PresignedUpload;
  }

  function updateUpload(id: string, nextUpload: Partial<UploadItem>) {
    setUploads((currentUploads) =>
      currentUploads.map((upload) =>
        upload.id === id ? { ...upload, ...nextUpload } : upload
      )
    );
  }

  async function uploadToS3(file: File, uploadUrl: string, id: string) {
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();

      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          updateUpload(id, {
            progress: Math.round((event.loaded / event.total) * 100),
          });
        }
      };

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve();
        } else {
          reject(new Error("Upload failed. Please try again."));
        }
      };
      request.onerror = () => reject(new Error("Upload failed. Please try again."));
      request.open("PUT", uploadUrl);
      request.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );
      request.send(file);
    });
  }

  async function uploadFile(file: File, id: string) {
    updateUpload(id, { status: "uploading", progress: 0 });

    try {
      const presignedUpload = await createUploadUrl(file);
      await uploadToS3(file, presignedUpload.uploadUrl, id);
      updateUpload(id, {
        status: "complete",
        progress: 100,
        upload: presignedUpload,
      });
      return { ok: true };
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Please try again.";

      updateUpload(id, {
        status: "failed",
        error: message,
      });
   
      return { ok: false, message };
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const uploadsList = uploads.filter(
      (upload) => upload.status === "pending" || upload.status === "failed"
    );

    if (uploadsList.length === 0) {
      setError("Choose one or more files before uploading.");
      return;
    }

    setError(null);
    setIsUploading(true);

    const results = await Promise.all(
      uploadsList.map((upload) => uploadFile(upload.file, upload.id))
    );

    const failedCount = results.filter((result) => !result.ok).length;

    if (failedCount > 0) {
      const message = `${failedCount} ${
        failedCount === 1 ? "file" : "files"
      } failed to upload.`;
      setError(message);
      toast.error(message);
    } else {
      setUploads((currentUploads) => {
        revokePreviewUrls(currentUploads);
        return [];
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      toast.success(
        `${uploadsList.length} ${uploadsList.length === 1 ? "file" : "files"} uploaded`
      );
    }

    setIsUploading(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    setError(null);

    if (files.length === 0) {
      return;
    }

    updateSelectedFiles(files);
    event.currentTarget.value = "";
  }

  function handleDragOver(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);

    setError(null);

    if (files.length === 0) {
      return;
    }

    updateSelectedFiles(files);
  }

  function handleRemoveUpload(id: string) {
    setUploads((currentUploads) => {
      const nextUploads = currentUploads.filter((upload) => upload.id !== id);
      revokePreviewUrls(currentUploads.filter((upload) => upload.id === id));
      return nextUploads;
    });
  }
  const completedUploads = uploads.filter((upload) => upload.status === "complete");
  const hasCompletedUploads = completedUploads.length > 0;
  const uploadProgress =
    uploads.length > 0
      ? Math.round(
          uploads.reduce((total, upload) => total + upload.progress, 0) /
            uploads.length
        )
      : 0;

  return (
    <Card className="max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Upload Files
        </CardTitle>
       <CardDescription>
          Choose one or more files to upload. Supported formats include PNG, JPG,
          PDF and more.
       </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={Boolean(error)}>
              <button
                type="button"
                className={`flex h-50 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-center transition-colors ${
                  isDragging
                      ? "border-primary bg-primary/10"
                    : "border-muted bg-muted/50 hover:bg-muted/70"
                }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={isUploading}
                aria-label="Choose files to upload or drop files here"
              >
                
                <IconFolderOpenFilled className={`size-12 ${isDragging ? "fill-primary animate-bounce" : "fill-primary"}`} />
                <p className="mt-2 text-sm font-semibold font-heading text-foreground">
                  {isDragging ? "Drop files here" : "Click to choose files"}
                </p>
                <p className="text-xs text-muted-foreground ">
                  {isDragging ? "Release to add files" : "PNG, JPG, PDF and other supported files"}
                </p>
              </button>

              <Input
                ref={inputRef}
                id="test-file"
                type="file"
                multiple
                className="sr-only"
                onChange={handleFileChange}
                aria-invalid={Boolean(error)}
                disabled={isUploading}
              />
              <FieldError>{error}</FieldError>
            </Field>
          </FieldGroup>

          {isUploading && <Progress value={uploadProgress} />}

          <Button type="submit" disabled={isUploading}>
            <IconUpload data-icon="inline-start" />
            {isUploading ? "Uploading" : "Upload files"}
          </Button>

          {uploads.length > 0 && (
            <div className="flex flex-col gap-2">
              {(showAll ? uploads : uploads.slice(0, INITIAL_DISPLAY_COUNT)).map((upload) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm"
                  key={upload.id}
                >
                  <div className="size-8 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {upload.previewUrl ? (
                      <Image
                        src={upload.previewUrl}
                        alt={upload.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-medium uppercase text-muted-foreground">
                        {upload.name.split(".").pop()?.slice(0, 3) ?? "file"}
                      </div>
                    )}
                  </div>

                  <span className="min-w-0 flex-1 truncate">{upload.name}</span>

                  {!isUploading && (
                    <Button
                      variant="outline"
                      size="icon-xs"
                      type="button"
                      onClick={() => handleRemoveUpload(upload.id)}
                      aria-label={`Remove ${upload.name} from upload list`}
                    >
                      <IconX />
                    </Button>
                  )}

                  {upload.status === "uploading" && (
                    <Badge variant="secondary">{upload.progress}%</Badge>
                  )}

                  {upload.status === "failed" && (
                    <Badge variant="destructive">failed</Badge>
                  )}
                </div>
              ))}

              {uploads.length > INITIAL_DISPLAY_COUNT && (
                <Button
                  variant="ghost"
                  size="lg"
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll ? (
                    <>
                      <BsArrowUpCircleFill className="size-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <BsArrowDownCircleFill className="size-4" />
                      Show {uploads.length - INITIAL_DISPLAY_COUNT} more
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {hasCompletedUploads && (
            <Alert>
              <AlertTitle>Upload complete</AlertTitle>
              <AlertDescription>
                <div className="flex flex-col gap-1">
                  {completedUploads.map((upload) =>
                    upload.upload?.fileUrl ? (
                      <Link
                        href={upload.upload.fileUrl}
                        key={upload.id}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {upload.name}
                      </Link>
                    ) : (
                      <span key={upload.id}>{upload.upload?.key}</span>
                    )
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
