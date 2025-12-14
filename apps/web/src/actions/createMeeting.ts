"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma, PrismaType } from "@repo/db";
import { generateBlueprint } from "./generateBlueprint";

export type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string | null;
};

interface CreateMeetingInput {
  companyName: string;
  companyWebsite?: string;
  roleToApply: string;
  requirements: string;
  resume: {
    name: string;
    key: string;
    size: number;
  };
}

export async function createMeeting(input: CreateMeetingInput): Promise<ActionResponse<{ meetingId: string }>> {
  try {
    // validate authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
        error: "User is not authenticated",
      };
    }

    const userId = session.user.id;

    // validate required fields
    if (!input.companyName || !input.roleToApply || !input.requirements || !input.resume.key) {
      return {
        success: false,
        message: "Missing required fields",
        error: "All required fields must be provided",
      };
    }

    // verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      console.error(`[createMeeting] User not found in database: ${userId}`);
      return {
        success: false,
        message: "User not found",
        error: "Your user account does not exist in the database. Please sign in again.",
      };
    }

    // generate blueprint first
    let blueprintData;
    try {
      blueprintData = await generateBlueprint(
        input.resume.key,
        input.companyName,
        input.companyWebsite || null,
        input.roleToApply,
        input.requirements
      );
    } catch (blueprintError) {
      console.error(`[createMeeting] Blueprint generation failed:`, blueprintError);
      return {
        success: false,
        message: "Failed to generate interview blueprint",
        error: blueprintError instanceof Error ? blueprintError.message : "Failed to generate blueprint. Please try again.",
      };
    }

    // save everything to database
    const meeting = await prisma.$transaction(async (tx) => {
      // create resume record first
      const newResume = await tx.resume.create({
        data: {
          userId,
          name: input.resume.name,
          size: input.resume.size,
          s3Key: input.resume.key,
        },
      });

      // create meeting with the resume ID
      const newMeeting = await tx.meeting.create({
        data: {
          userId,
          companyName: input.companyName,
          companyWebsite: input.companyWebsite || null,
          roleToApply: input.roleToApply,
          requirements: input.requirements,
          status: "QUESTIONNAIRE_READY",
          resumeId: newResume.id,
        },
      });

      // create blueprint
      await tx.interviewBlueprint.create({
        data: {
          meetingId: newMeeting.id,
          totalQuestions: blueprintData.total_questions,
          categories: blueprintData.categories as unknown as PrismaType.InputJsonValue,
          rationale: blueprintData.rationale,
          initialNotes: blueprintData.initial_notes,
        },
      });

      return newMeeting;
    });

    console.log(`[createMeeting] Meeting and blueprint saved with ID: ${meeting.id}`);

    return {
      success: true,
      message: "Meeting created successfully",
      data: { meetingId: meeting.id },
    };
  } catch (error) {
    console.error("[createMeeting] Error creating meeting:", error);
    return {
      success: false,
      message: "Failed to create meeting",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
