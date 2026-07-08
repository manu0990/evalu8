"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma, PrismaType } from "@repo/db";
import { generateBlueprint } from "./generateBlueprint";
import type { ActionResponse } from "./createMeeting";

export async function retryBlueprintGeneration(meetingId: string): Promise<ActionResponse> {
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

    // fetch meeting with ownership check and resume data
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { resume: true },
    });

    if (!meeting) {
      return { success: false, message: "Meeting not found", error: "The meeting does not exist" };
    }

    if (meeting.userId !== userId) {
      return { success: false, message: "Unauthorized", error: "You do not have permission" };
    }

    if (meeting.status !== "FAILED") {
      return { success: false, message: "Invalid status", error: "Only failed meetings can be retried" };
    }

    // set status back to PENDING immediately
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "PENDING" },
    });

    // fire-and-forget: regenerate blueprint in background
    generateBlueprint(
      meeting.resume.s3Key,
      meeting.companyName,
      meeting.companyWebsite || null,
      meeting.roleToApply,
      meeting.requirements
    )
      .then(async (blueprintData) => {
        // delete any old failed blueprint attempt if exists
        await prisma.interviewBlueprint.deleteMany({
          where: { meetingId },
        });

        await prisma.interviewBlueprint.create({
          data: {
            meetingId,
            totalQuestions: blueprintData.total_questions,
            categories: blueprintData.categories as unknown as PrismaType.InputJsonValue,
            rationale: blueprintData.rationale,
            initialNotes: blueprintData.initial_notes,
          },
        });
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { status: "QUESTIONNAIRE_READY" },
        });
        console.log(`[retryBlueprint] Blueprint generated successfully for meeting: ${meetingId}`);
      })
      .catch(async (err) => {
        console.error(`[retryBlueprint] Blueprint generation failed again for meeting ${meetingId}:`, err);
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { status: "FAILED" },
        }).catch((updateErr) => {
          console.error(`[retryBlueprint] Failed to update meeting status to FAILED:`, updateErr);
        });
      });

    return {
      success: true,
      message: "Blueprint generation restarted",
    };
  } catch (error) {
    console.error("[retryBlueprint] Error:", error);
    return {
      success: false,
      message: "Failed to retry blueprint generation",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
