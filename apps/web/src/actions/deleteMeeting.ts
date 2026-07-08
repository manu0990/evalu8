"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { deleteFromS3 } from "./deleteFromS3";
import type { ActionResponse } from "./createMeeting";

export async function deleteMeeting(meetingId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
        error: "User is not authenticated",
      };
    }

    const userId = session.user.id;

    // fetch meeting with ownership check
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { resume: true },
    });

    if (!meeting) {
      return {
        success: false,
        message: "Meeting not found",
        error: "The meeting does not exist",
      };
    }

    if (meeting.userId !== userId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "You do not have permission to delete this meeting",
      };
    }

    // delete resume file from S3
    if (meeting.resume?.s3Key) {
      await deleteFromS3(meeting.resume.s3Key).catch((err) => {
        console.error(`[deleteMeeting] Failed to delete S3 file:`, err);
      });
    }

    // delete meeting from DB (cascades to messages, blueprint, wsTickets)
    await prisma.meeting.delete({
      where: { id: meetingId },
    });

    // delete the orphaned resume record
    if (meeting.resumeId) {
      await prisma.resume.delete({
        where: { id: meeting.resumeId },
      }).catch((err) => {
        console.error(`[deleteMeeting] Failed to delete resume record:`, err);
      });
    }

    return {
      success: true,
      message: "Meeting deleted successfully",
    };
  } catch (error) {
    console.error("[deleteMeeting] Error:", error);
    return {
      success: false,
      message: "Failed to delete meeting",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
