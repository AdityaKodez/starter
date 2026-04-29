"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import Image from "next/image";
import { AttachmentProcessingProgress } from "./attachment-processing-progress";
import { UploadItem } from "./types";

type UploadItemCardProps = {
  upload: UploadItem;
  isUploading: boolean;
  onRemove: (id: string) => void;
};

export function UploadItemCard({
  upload,
  isUploading,
  onRemove,
}: UploadItemCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm">
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

      {!isUploading && upload.status !== "uploading" && (
        <Button
          variant="outline"
          size="icon-xs"
          type="button"
          onClick={() => onRemove(upload.id)}
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

      {upload.upload?.attachmentId && (
        <div className="basis-full">
          <AttachmentProcessingProgress
            attachmentId={upload.upload.attachmentId}
          />
        </div>
      )}
    </div>
  );
}
