import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { processAttachment } from "@/jobs/analyse-attachments";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processAttachment
  ],
});
