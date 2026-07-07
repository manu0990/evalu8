"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import type { ActionResponse } from "./createMeeting";
import type { MeetingStatus } from "@/components/app-layout/MeetingCard";

export interface DashboardStats {
  totalMeetings: number;
  completedMeetings: number;
  readyMeetings: number;
  inProgressMeetings: number;
  pendingMeetings: number;
  cancelledMeetings: number;
  completionRate: number;
  averageScore: number | null;
  activityTimeline: { date: string; count: number }[];
  statusDistribution: {
    status: string;
    count: number;
    fill: string;
  }[];
  recentMeetings: {
    id: string;
    companyName: string;
    roleToApply: string;
    status: MeetingStatus;
    createdAt: string;
    score?: number;
  }[];
}

export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
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

    // Fetch all meetings for counting
    const meetings = await prisma.meeting.findMany({
      where: { userId },
      select: { status: true, createdAt: true },
    });

    // Compute status counts
    const statusCounts = { PENDING: 0, QUESTIONNAIRE_READY: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    meetings.forEach(m => {
      if (statusCounts[m.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[m.status as keyof typeof statusCounts]++;
      }
    }); 

    // Compute activity timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activityMap = new Map<string, number>();
    
    for (let i = 0; i <= 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      if (dateStr) {
        activityMap.set(dateStr, 0);
      }
    }
    
    meetings.forEach(m => {
      const key = m.createdAt.toISOString().split('T')[0];
      if (key && activityMap.has(key)) {
        activityMap.set(key, (activityMap.get(key) || 0) + 1);
      }
    });
    
    const activityTimeline = Array.from(activityMap.entries()).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }));

    // Average score
    const evaluations = await prisma.evaluation.findMany({
      where: { meeting: { userId } },
      select: { score: true },
    });
    
    const averageScore = evaluations.length > 0
      ? Math.round(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
      : null;

    // Recent meetings (last 5)
    const recentMeetings = await prisma.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        companyName: true,
        roleToApply: true,
        status: true,
        createdAt: true,
        evaluation: { select: { score: true } },
      },
    });

    const total = meetings.length;

    return {
      success: true,
      message: "Stats fetched successfully",
      data: {
        totalMeetings: total,
        completedMeetings: statusCounts.COMPLETED,
        readyMeetings: statusCounts.QUESTIONNAIRE_READY,
        inProgressMeetings: statusCounts.IN_PROGRESS,
        pendingMeetings: statusCounts.PENDING,
        cancelledMeetings: statusCounts.CANCELLED,
        completionRate: total > 0 ? Math.round((statusCounts.COMPLETED / total) * 100) : 0,
        averageScore,
        activityTimeline,
        statusDistribution: [
          { status: "Completed", count: statusCounts.COMPLETED, fill: "var(--color-chart-2)" },
          { status: "Ready", count: statusCounts.QUESTIONNAIRE_READY, fill: "var(--color-chart-1)" },
          { status: "In Progress", count: statusCounts.IN_PROGRESS, fill: "var(--color-chart-5)" },
          { status: "Processing", count: statusCounts.PENDING, fill: "var(--color-chart-3)" },
          { status: "Cancelled", count: statusCounts.CANCELLED, fill: "var(--color-destructive)" },
        ],
        recentMeetings: recentMeetings.map(m => ({
          id: m.id,
          companyName: m.companyName,
          roleToApply: m.roleToApply,
          status: m.status as MeetingStatus,
          createdAt: m.createdAt.toISOString(),
          score: m.evaluation?.score ?? undefined,
        })),
      },
    };
  } catch (error) {
    console.error("[getDashboardStats] Error:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
