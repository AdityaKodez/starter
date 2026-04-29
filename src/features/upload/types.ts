export type PresignedUpload = {
  attachmentId: string;
  uploadUrl: string;
  publicUrl: string | null;
};

export type UploadStatus = "pending" | "uploading" | "complete" | "failed";

export type UploadItem = {
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

export type FileUploadProps = {
  onUploaded?: (attachmentIds: string[]) => void;
};
