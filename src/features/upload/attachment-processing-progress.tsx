"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  attachmentProcessingChannel,
  type AttachmentProcessingStatus,
} from "@/lib/attachment-processing-realtime";
import {
  IconFileAnalytics,
  IconFileSearch,
  IconFolderOpenFilled,
  IconSearchFilled,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useRealtime } from "inngest/react";
import { getAttachmentProcessingToken } from "./actions";

export const processingProgress: Record<AttachmentProcessingStatus, number> = {
  UPLOADED: 8,
  QUEUED: 15,
  OCR_PROCESSING: 35,
  OCR_COMPLETED: 58,
  CHUNKING: 75,
  ANALYZING: 88,
  COMPLETED: 100,
  FAILED: 100,
};

export function getStatusVariant(status: AttachmentProcessingStatus) {
  if (status === "FAILED") {
    return "destructive" as const;
  }

  if (status === "COMPLETED") {
    return "default" as const;
  }

  return "secondary" as const;
}

export function getIconForStatus(status: AttachmentProcessingStatus) {
  switch (status) {
    case "QUEUED":
      return <IconFolderOpenFilled className="h-4 w-4" />;
    case "OCR_PROCESSING":
      return <IconUpload className="h-4 w-4" />;
    case "OCR_COMPLETED":
      return <IconFileAnalytics className="h-4 w-4" />;
    case "CHUNKING":
      return <IconFileSearch className="h-4 w-4" />;
    case "ANALYZING":
      return <IconSearchFilled className="h-4 w-4" />;
    case "COMPLETED":
      return <IconUpload className="h-4 w-4" />;
    case "FAILED":
      return <IconX className="h-4 w-4" />;
    default:
      return null;
  }
}

export function AttachmentProcessingProgress({
  attachmentId,
}: {
  attachmentId: string;
}) {
  const topics = ["status"] as const;
  const channel = attachmentProcessingChannel({ attachmentId });
  const { connectionStatus, messages, error } = useRealtime({
    channel,
    topics,
    token: () => getAttachmentProcessingToken(attachmentId),
    enabled: Boolean(attachmentId),
    historyLimit: 20,
    bufferInterval: 100,
    autoCloseOnTerminal: true,
  });

  const latestStatus = messages.byTopic.status?.data;
  const status = latestStatus?.status ?? "UPLOADED";
  const progress = processingProgress[status];
  const errorMessage = latestStatus?.errorMessage ?? error?.message;
  const hasProcessingFailed = status === "FAILED" || Boolean(errorMessage);
  const message =
    latestStatus?.message ??
    (connectionStatus === "open"
      ? "Waiting for background processing"
      : "Connecting to processing updates");
  const pageCount = latestStatus?.pageCount;
  const chunkCount = latestStatus?.chunkCount;
  const statusMeta = [
    `Realtime ${connectionStatus}`,
    pageCount ? `${pageCount} pages` : null,
    chunkCount ? `${chunkCount} chunks` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div
      className={`mt-2 flex flex-col gap-2 rounded-md border p-3 ${
        hasProcessingFailed
          ? "border-destructive/40 bg-destructive/5"
          : "bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">
            {message}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {statusMeta}
          </p>
        </div>
        <Badge variant={getStatusVariant(status)} className="ml-auto h-5 px-2 text-xs font-medium">
          {getIconForStatus(status)}
          {status ? status.split(/(?=[A-Z])/).join(" ") : null}
        </Badge>
      </div>
      <Progress value={progress} />
      {errorMessage && (
        <Alert variant="destructive" className="py-2">
          <AlertTitle className="text-xs">Processing error</AlertTitle>
          <AlertDescription className="text-xs">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
