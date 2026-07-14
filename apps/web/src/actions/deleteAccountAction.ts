"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { ActionResponse } from "./createMeeting";

import { s3 } from "@/lib/s3Client";
import { ListObjectsV2Command, DeleteObjectsCommand, ListObjectsV2CommandInput } from "@aws-sdk/client-s3";

async function deleteUserS3Data(userId: string) {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) return;

  const prefixes = [
    `${userId}-`,
    `resumes/${userId}-`,
    `profile_pics/${userId}-`
  ];

  for (const prefix of prefixes) {
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const input: ListObjectsV2CommandInput = {
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      };
      const listCommand = new ListObjectsV2Command(input);

      const listedObjects = await s3.send(listCommand);

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key })),
            Quiet: true,
          },
        });

        await s3.send(deleteCommand);
      }

      isTruncated = listedObjects.IsTruncated ?? false;
      continuationToken = listedObjects.NextContinuationToken;
    }
  }
}

export async function deleteAccountAction(): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Authentication required" };

    const userId = session.user.id;

    // Delete S3 data first
    await deleteUserS3Data(userId).catch(e => {
      console.error("Failed to delete user S3 data:", e);
    });

    // Delete user. If onDelete: Cascade is configured, this deletes everything else.
    await prisma.user.delete({
      where: { id: userId }
    });

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    return { success: false, message: "Error deleting account", error: String(error) };
  }
}
