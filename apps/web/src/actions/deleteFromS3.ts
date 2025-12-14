"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"
import { type ActionResponse } from "./getSignedUrl";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3Client";

export async function deleteFromS3(key: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        message: "Authentication required",
        error: "User is not authenticated"
      };
    }

    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key
    });

    const res = await s3.send(deleteObjectCommand);

    return {
      success: true,
      message: res.$metadata.httpStatusCode === 204 ? "File deleted successfully" : "File deletion response received",
    };

  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
