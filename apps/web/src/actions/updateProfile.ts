"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { ActionResponse } from "./createMeeting";
import { deleteFromS3 } from "./deleteFromS3";
import { z } from "zod";

const ProfileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  username: z.string().min(1, "Username is required").regex(/^[^@].*$/, "Username cannot start with '@'").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  urls: z.array(
    z.string().superRefine((val, ctx) => {
      try {
        new URL(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${val} is not a valid url`,
        });
      }
    })
  ).max(5, "Maximum 5 URLs allowed").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

export async function updateProfile(data: {
  name?: string;
  username?: string;
  bio?: string;
  urls?: string[];
  image?: string;
}): Promise<ActionResponse> {
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

    // Validate using Zod
    const validation = ProfileUpdateSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed",
        error: validation.error.issues[0]?.message || "Invalid input",
      };
    }

    const validData = validation.data;

    // Validate username uniqueness if provided
    if (validData.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: validData.username },
      });
      if (existingUser && existingUser.id !== userId) {
        return {
          success: false,
          message: "Username already taken",
          error: "Username already taken",
        };
      }
    }

    // Validate URLs (make unique)
    let uniqueUrls: string[] = [];
    if (validData.urls) {
      uniqueUrls = Array.from(new Set(validData.urls.filter((url) => url.trim().length > 0))).slice(0, 5);
    }

    // Check if image is being updated and delete old image from S3 if it exists
    if (validData.image) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true }
      });
      
      if (currentUser?.image && currentUser.image !== validData.image) {
        try {
          const urlObj = new URL(currentUser.image);
          if (urlObj.hostname.includes('amazonaws.com')) {
            const key = urlObj.pathname.substring(1); // remove leading slash
            if (key.startsWith('profile_pics/')) {
              await deleteFromS3(key).catch((err) => {
                console.error("deleteFromS3 failed", err);
              });
            }
          }
        } catch (e) {
          console.error("Failed to parse old image URL or delete from S3", e);
        }
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(validData.name !== undefined && { name: validData.name }),
        ...(validData.username !== undefined && { username: validData.username }),
        ...(validData.bio !== undefined && { bio: validData.bio }),
        ...(validData.urls !== undefined && { urls: uniqueUrls }),
        ...(validData.image !== undefined && { image: validData.image }),
      },
    });

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("[updateProfile] Error:", error);
    return {
      success: false,
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
