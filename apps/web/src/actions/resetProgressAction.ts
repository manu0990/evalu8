"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { ActionResponse } from "./createMeeting";

export async function resetProgressAction(): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Authentication required" };



    // Prisma doesn't always cascade automatically unless configured in schema.
    // Let's delete all meetings for the user.
    await prisma.meeting.deleteMany({
      where: { userId: session.user.id }
    });

    return { success: true, message: "Progress reset successfully" };
  } catch (error) {
    return { success: false, message: "Error resetting progress", error: String(error) };
  }
}
