"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3Client";

import { z } from "zod";
import { ActionResponse } from "./createMeeting";

const UploadSchema = z.object({
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().min(1, "File size must be greater than 0"),
  purpose: z.enum(["resume", "profile_pic"]),
});

export async function getUploadSignedUrl(input: {
  fileType: string;
  fileSize: number;
  purpose: "resume" | "profile_pic";
}): Promise<ActionResponse<{ url: string; key: string; publicUrl: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required", error: "User not authenticated" };
    }

    // Validate inputs with Zod
    const validation = UploadSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: "Invalid input parameters",
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const { fileType, fileSize, purpose } = validation.data;
    let key = "";
    let folder = "";

    if (purpose === "resume") {
      if (fileType !== "application/pdf") {
        return { success: false, message: "Invalid file type", error: "Only PDF files are allowed for resumes" };
      }
      if (fileSize > 10 * 1024 * 1024) {
        return { success: false, message: "File too large", error: "Resumes must be under 10MB" };
      }



      folder = "resumes";
      key = `${folder}/${session.user.id}-${Date.now()}.pdf`;
    } else if (purpose === "profile_pic") {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(fileType)) {
        return {
          success: false,
          message: "Invalid file type",
          error: "Only PNG, JPG, and JPEG images are allowed (GIF is not supported)",
        };
      }
      if (fileSize > 5 * 1024 * 1024) {
        return { success: false, message: "File too large", error: "Profile pictures must be under 5MB" };
      }

      const extension = fileType.split("/")[1] || "png";
      folder = "profile_pics";
      key = `${folder}/${session.user.id}-${Date.now()}.${extension}`;
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    if (!bucketName || !region) {
      return { success: false, message: "Storage configuration error", error: "S3 Bucket Name or Region is not configured on the server" };
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const signedUrl = await getS3SignedUrl(s3, putObjectCommand, { expiresIn: 120 });
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return {
      success: true,
      message: "Signed URL generated successfully",
      data: {
        url: signedUrl,
        key: key,
        publicUrl,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
