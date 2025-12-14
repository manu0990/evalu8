"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3Client";

// TODO: Need to specify the data Type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string | null;
};

export async function getSignedUrl(size: number): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        message: "Authentication required",
        error: "User is not authenticated"
      };
    }

    const key = `${session.user.id}-${Date.now().toString()}.pdf`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: "application/pdf",
      ContentLength: size,

    });

    const signedUrl = await getS3SignedUrl(s3, putObjectCommand, {
      expiresIn: 120  // URL expiration time in seconds
    });

    return {
      success: true,
      message: "Signed URL generated successfully",
      data: {
        url: signedUrl,
        key: key
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
