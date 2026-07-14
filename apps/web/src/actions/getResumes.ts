"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import type { Resume } from "@repo/db";
import { ActionResponse } from "./createMeeting";

export async function getResumes(): Promise<ActionResponse<Resume[]>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Authentication required", error: "User not authenticated" };
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { id: 'desc' }
    });

    return { success: true, message: "Resumes fetched successfully", data: resumes };
  } catch (error) {
    return { success: false, message: "Failed to fetch resumes", error: String(error) };
  }
}
