"use client";

import { useMutation } from "@tanstack/react-query";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { IconFolderOpenFilled, IconUpload } from "@tabler/icons-react";
import { BsArrowDownCircleFill, BsArrowUpCircleFill } from "react-icons/bs";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

import {
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOADS_PER_REQUEST,
} from "@/configs/const/mistake";
import { useTRPC } from "@/trpc/client";
import { type PresignedUpload, type UploadItem, type FileUploadProps } from "./types";
import { UploadItemCard } from "./upload-item-card";

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
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null,
  };
}

const INITIAL_DISPLAY_COUNT = 3;

export function FileUpload({ onUploaded }: FileUploadProps = {}) {
  const trpc = useTRPC();
  const prepareUploadsMutation = useMutation(
    trpc.attachment.prepareUploads.mutationOptions(),
  );
  const markUploadedMutation = useMutation(
    trpc.attachment.markUploaded.mutationOptions(),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  function revokePreviewUrls(currentUploads: UploadItem[]) {
    currentUploads.forEach((upload) => {
      if (upload.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(upload.previewUrl);
      }
    });
  }

  function updateSelectedFiles(files: File[]) {
    if (files.length > MAX_UPLOADS_PER_REQUEST) {
      setError(`You can only upload ${MAX_UPLOADS_PER_REQUEST} files at a time.`);
      return;
    }
    const totalFileSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalFileSize > MAX_UPLOAD_SIZE_BYTES) {
      setError("You can only upload files up to 25MB.");
      return;
    }
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

  function updateUpload(id: string, nextUpload: Partial<UploadItem>) {
    setUploads((currentUploads) =>
      currentUploads.map((upload) =>
        upload.id === id ? { ...upload, ...nextUpload } : upload,
      ),
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
      request.onerror = () =>
        reject(new Error("Upload failed. Please try again."));
      request.open("PUT", uploadUrl);
      request.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
      );
      request.send(file);
    });
  }

  async function uploadFile(
    file: File,
    id: string,
    presignedUpload: PresignedUpload,
  ) {
    updateUpload(id, { status: "uploading", progress: 0 });

    try {
      await uploadToS3(file, presignedUpload.uploadUrl, id);
      updateUpload(id, {
        status: "complete",
        progress: 100,
        upload: presignedUpload,
      });
      return { ok: true, attachmentId: presignedUpload.attachmentId };
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
      (upload) => upload.status === "pending" || upload.status === "failed",
    );

    if (uploadsList.length === 0) {
      setError("Choose one or more files before uploading.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const preparedUploads = await prepareUploadsMutation.mutateAsync({
        files: uploadsList.map((upload) => ({
          fileName: upload.file.name,
          mimeType: upload.file.type || "application/octet-stream",
          sizeBytes: upload.file.size,
        })),
      });

      const results = await Promise.all(
        uploadsList.map((upload, index) =>
          uploadFile(upload.file, upload.id, preparedUploads[index]),
        ),
      );

      const uploadedAttachmentIds = results
        .filter(
          (result): result is { ok: true; attachmentId: string } =>
            result.ok === true,
        )
        .map((result) => result.attachmentId);

      if (uploadedAttachmentIds.length > 0) {
        await markUploadedMutation.mutateAsync({
          attachmentIds: uploadedAttachmentIds,
        });
        onUploaded?.(uploadedAttachmentIds);
      }

      const failedCount = results.filter((result) => !result.ok).length;

      if (failedCount > 0) {
        const message = `${failedCount} ${
          failedCount === 1 ? "file" : "files"
        } failed to upload.`;
        setError(message);
        toast.error(message);
      } else {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        toast.success(
          `${uploadsList.length} ${
            uploadsList.length === 1 ? "file" : "files"
          } uploaded`,
        );
      }
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Please try again.";
      setError(message);
      toast.error(message);
      uploadsList.forEach((upload) => {
        updateUpload(upload.id, {
          status: "failed",
          error: message,
        });
      });
    } finally {
      setIsUploading(false);
    }
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

  const uploadProgress =
    uploads.length > 0
      ? Math.round(
          uploads.reduce((total, upload) => total + upload.progress, 0) /
            uploads.length,
        )
      : 0;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Upload Files
        </CardTitle>
        <CardDescription>
          Choose one or more files to upload. Supported formats include PNG,
          JPG, PDF and more.
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
                <IconFolderOpenFilled
                  className={`size-12 ${isDragging ? "fill-primary animate-bounce" : "fill-primary"}`}
                />
                <p className="mt-2 text-sm font-semibold font-heading text-foreground">
                  {isDragging ? "Drop files here" : "Click to choose files"}
                </p>
                <p className="text-xs text-muted-foreground ">
                  {isDragging
                    ? "Release to add files"
                    : "PNG, JPG, PDF and other supported files (Max file size 25MB )"}
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
              <FieldError className="text-xs text-center">{error}</FieldError>
            </Field>
          </FieldGroup>

          {isUploading && <Progress value={uploadProgress} />}

          <Button type="submit" disabled={isUploading}>
            <IconUpload data-icon="inline-start" />
            {isUploading ? "Uploading" : "Upload files"}
          </Button>

          {uploads.length > 0 && (
            <div className="flex flex-col gap-2">
              {(showAll
                ? uploads
                : uploads.slice(0, INITIAL_DISPLAY_COUNT)
              ).map((upload) => (
                <UploadItemCard
                  key={upload.id}
                  upload={upload}
                  isUploading={isUploading}
                  onRemove={handleRemoveUpload}
                />
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
        </form>
      </CardContent>
    </Card>
  );
}