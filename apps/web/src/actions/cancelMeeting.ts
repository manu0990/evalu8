'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";

export async function cancelMeeting(meetingId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { userId: true },
    });

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    if (meeting.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath("/meetings");
    revalidatePath(`/interview/${meetingId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel meeting:", error);
    return { success: false, error: "Failed to cancel meeting" };
  }
}
