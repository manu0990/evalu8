"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import type { ActionResponse } from "./createMeeting";
import type { MeetingStatus } from "@/components/app-layout/MeetingCard";

export interface MeetingData {
  id: string;
  companyName: string;
  companyWebsite?: string;
  roleToApply: string;
  requirements: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export async function getMeetings(): Promise<ActionResponse<MeetingData[]>> {
  try {
    // Validate authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
        error: "User is not authenticated",
      };
    }

    const userId = session.user.id;

    // Fetch meetings for the authenticated user
    const meetings = await prisma.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        companyWebsite: true,
        roleToApply: true,
        requirements: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
      },
    });

    // Convert dates to ISO strings for serialization
    const serializedMeetings = meetings.map((meeting: typeof meetings[0]) => ({
      ...meeting,
      companyWebsite: meeting.companyWebsite || undefined,
      createdAt: meeting.createdAt.toISOString(),
      updatedAt: meeting.updatedAt.toISOString(),
      completedAt: meeting.completedAt?.toISOString() || undefined,
    }));

    return {
      success: true,
      message: "Meetings fetched successfully",
      data: serializedMeetings,
    };
  } catch (error) {
    console.error("[getMeetings] Error fetching meetings:", error);
    return {
      success: false,
      message: "Failed to fetch meetings",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
