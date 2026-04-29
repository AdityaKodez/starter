import "server-only";

import { TextractClient } from "@aws-sdk/client-textract";

export const textract = new TextractClient({
  region: process.env.AWS_REGION ?? "ap-south-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});
