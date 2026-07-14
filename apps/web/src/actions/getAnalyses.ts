"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { ActionResponse, AnalysisResult } from "./runAnalysis";

export async function getAnalyses(meetingId: string): Promise<ActionResponse<AnalysisResult[]>> {
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
    });

    if (!meeting) {
      return {
        success: false,
        message: "Meeting not found",
        error: "Meeting not found",
      };
    }

    const analyses = await prisma.analysis.findMany({
      where: { meetingId }
    });

    const parsedAnalyses: AnalysisResult[] = analyses.map(analysis => {
      let feedback = null;
      if (analysis.status === 'COMPLETED' && analysis.feedback) {
        try {
          feedback = JSON.parse(analysis.feedback);
        } catch (e) {
          console.error(`Error parsing feedback for analysis ${analysis.id}`, e);
        }
      }

      return {
        id: analysis.id,
        type: analysis.type,
        status: analysis.status as 'COMPLETED' | 'FAILED' | 'PROCESSING',
        score: analysis.score,
        feedback: feedback
      } as AnalysisResult;
    });

    return {
      success: true,
      message: "Analyses fetched successfully",
      data: parsedAnalyses
    };
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return {
      success: false,
      message: "Failed to fetch analyses",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
