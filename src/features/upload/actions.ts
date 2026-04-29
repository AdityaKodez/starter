"use server";

import { getClientSubscriptionToken } from "inngest/react";

import { attachmentProcessingChannel } from "@/lib/attachment-processing-realtime";
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/auth-utils";

export async function getAttachmentProcessingToken(attachmentId: string) {
  const session = await requireAuth();

  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!attachment) {
    throw new Error("Attachment not found.");
  }

  return getClientSubscriptionToken(inngest, {
    channel: attachmentProcessingChannel({ attachmentId }),
    topics: ["status"],
  });
}
