import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get("meetingId");

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    // Verify the meeting exists and belongs to the user
    // Since we don't know the exact schema for Meeting but we know it has `userId`
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { userId: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your meeting" }, { status: 403 });
    }

    // Generate ticket valid for 30 seconds
    const expiresAt = new Date(Date.now() + 30 * 1000);

    const ticket = await prisma.wsTicket.create({
      data: {
        userId: session.user.id,
        meetingId: meetingId,
        expiresAt: expiresAt,
      },
    });

    return NextResponse.json({ ticketId: ticket.id });

  } catch (error) {
    console.error("Error generating WS ticket:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
