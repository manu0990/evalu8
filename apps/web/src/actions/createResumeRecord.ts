"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import type { Resume } from "@repo/db";
import { ActionResponse } from "./createMeeting";

export async function createResumeRecord(name: string, key: string, size: number): Promise<ActionResponse<Resume>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Authentication required", error: "User not authenticated" };

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        name,
        s3Key: key,
        size
      }
    });

    return { success: true, message: "Resume saved successfully", data: resume };
  } catch (error) {
    return { success: false, message: "Failed to save resume", error: String(error) };
  }
}
