"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { after } from "next/server";
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

    // save meeting to database immediately with PENDING status
    const meeting = await prisma.$transaction(async (tx) => {
      // find existing resume by s3Key, or create new if not found
      let dbResume = await tx.resume.findFirst({
        where: { s3Key: input.resume.key, userId }
      });

      if (!dbResume) {
        dbResume = await tx.resume.create({
          data: {
            userId,
            name: input.resume.name,
            size: input.resume.size,
            s3Key: input.resume.key,
          },
        });
      }

      // create meeting with PENDING status (blueprint not yet generated)
      const newMeeting = await tx.meeting.create({
        data: {
          userId,
          companyName: input.companyName,
          companyWebsite: input.companyWebsite || null,
          roleToApply: input.roleToApply,
          requirements: input.requirements,
          status: "PENDING",
          resumeId: dbResume.id,
        },
      });

      return newMeeting;
    });

    console.log(`[createMeeting] Meeting created with ID: ${meeting.id}, generating blueprint in background...`);

    // Use Next.js `after` to ensure Vercel doesn't kill the lambda before the background work finishes.
    after(async () => {
      try {
        const blueprintData = await generateBlueprint(
          input.resume.key,
          input.companyName,
          input.companyWebsite || null,
          input.roleToApply,
          input.requirements
        );

        await prisma.interviewBlueprint.create({
          data: {
            meetingId: meeting.id,
            totalQuestions: blueprintData.total_questions,
            categories: blueprintData.categories as unknown as PrismaType.InputJsonValue,
            rationale: blueprintData.rationale,
            initialNotes: blueprintData.initial_notes,
          },
        });
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { status: "QUESTIONNAIRE_READY" },
        });
        console.log(`[createMeeting] Blueprint generated and saved for meeting: ${meeting.id}`);
      } catch (err) {
        console.error(`[createMeeting] Background blueprint generation failed for meeting ${meeting.id}:`, err);
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { status: "FAILED" },
        }).catch((updateErr) => {
          console.error(`[createMeeting] Failed to update meeting status to FAILED:`, updateErr);
        });
      }
    });

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
