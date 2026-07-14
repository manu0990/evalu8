"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { ActionResponse } from "./createMeeting";

export async function checkUserAuthType(): Promise<ActionResponse<{ hasPassword: boolean }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Authentication required" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });

    return { 
      success: true, 
      message: "Success", 
      data: { hasPassword: !!user?.password } 
    };
  } catch (error) {
    return { success: false, message: "Error", error: String(error) };
  }
}
