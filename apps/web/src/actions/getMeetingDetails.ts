"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import type { ActionResponse } from "./createMeeting";
import type { MeetingStatus } from "@/components/app-layout/MeetingCard";

export interface MeetingDetailsData {
  id: string;
  companyName: string;
  companyWebsite?: string;
  roleToApply: string;
  requirements: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resume: {
    name: string;
  };
  interviewBlueprint?: {
    totalQuestions: number;
    categories: { type: string; target: number }[];
    rationale: string;
    initialNotes: string;
  };
}

export async function getMeetingDetails(meetingId: string): Promise<ActionResponse<MeetingDetailsData>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
        error: "User is not authenticated",
      };
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId, userId: session.user.id },
      include: {
        resume: true,
        interviewBlueprint: true,
      },
    });

    if (!meeting) {
      return {
        success: false,
        message: "Meeting not found",
        error: "Meeting not found",
      };
    }

    // Process categories safely
    let categories: { type: string; target: number }[] = [];
    if (meeting.interviewBlueprint?.categories) {
      // Assuming it acts as an array or JSON object that can be cast
      const rawCategories = meeting.interviewBlueprint.categories;
      if (Array.isArray(rawCategories)) {
        categories = rawCategories as { type: string; target: number }[];
      }
    }

    const data: MeetingDetailsData = {
      id: meeting.id,
      companyName: meeting.companyName,
      companyWebsite: meeting.companyWebsite || undefined,
      roleToApply: meeting.roleToApply,
      requirements: meeting.requirements,
      status: meeting.status as MeetingStatus,
      createdAt: meeting.createdAt.toISOString(),
      updatedAt: meeting.updatedAt.toISOString(),
      completedAt: meeting.completedAt?.toISOString() || undefined,
      resume: {
        name: meeting.resume?.name || "Unknown Resume",
      },
      interviewBlueprint: meeting.interviewBlueprint
        ? {
          totalQuestions: meeting.interviewBlueprint.totalQuestions,
          categories: categories,
          rationale: meeting.interviewBlueprint.rationale || "",
          initialNotes: meeting.interviewBlueprint.initialNotes || "",
        }
        : undefined,
    };

    return {
      success: true,
      message: "Meeting details fetched successfully",
      data,
    };
  } catch (error) {
    console.error("[getMeetingDetails] Error fetching meeting details:", error);
    return {
      success: false,
      message: "Failed to fetch meeting details",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
