"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3Client";
import { prisma } from "@repo/db";
import { ActionResponse } from "./createMeeting";

export async function getResumeDownloadUrl(resumeId: string): Promise<ActionResponse<{ url: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Authentication required" };

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) return { success: false, message: "Resume not found" };
    if (resume.userId !== session.user.id) return { success: false, message: "Unauthorized" };

    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: resume.s3Key,
    });

    const signedUrl = await getS3SignedUrl(s3, getObjectCommand, { expiresIn: 300 });

    return { success: true, message: "URL generated", data: { url: signedUrl } };
  } catch (error) {
    return { success: false, message: "Error", error: String(error) };
  }
}
