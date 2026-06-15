'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";

export async function getMeetingMessages(meetingId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { userId: true },
    });

    if (!meeting || meeting.userId !== session.user.id) {
      throw new Error("Forbidden or Not Found");
    }

    const messages = await prisma.message.findMany({
      where: { meetingId },
      orderBy: { timestamp: 'asc' },
    });

    return { 
      success: true, 
      messages: messages.map(msg => ({
        role: msg.sender === 'USER' ? 'user' as const : 'ai' as const,
        content: msg.content
      }))
    };
  } catch (error) {
    console.error("Failed to fetch meeting messages:", error);
    return { success: false, error: "Failed to fetch meeting messages", messages: [] };
  }
}
