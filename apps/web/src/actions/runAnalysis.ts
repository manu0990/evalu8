"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@repo/db";
import { getGeminiModel } from "@/lib/geminiClient";
import { getResumeBufferFromS3 } from "@/lib/s3ResumeReader";
import { interviewAnalysisPrompt, resumeAnalysisPrompt } from "@/lib/prompts/analysisPrompts";

export type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string | null;
};

export interface InterviewAnalysisFeedback {
  overall_score: number;
  sub_scores: {
    interview_performance: number;
    communication_structure: number;
    answer_quality: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  detailed_feedback: string;
}

export interface ResumeAnalysisFeedback {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  resume_suggestions: string[];
  detailed_feedback: string;
}

export interface AnalysisResult {
  id: string;
  type: 'INTERVIEW_ANALYSIS' | 'RESUME_ANALYSIS';
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  score: number | null;
  feedback: InterviewAnalysisFeedback | ResumeAnalysisFeedback | null;
}

async function verifyAndInitializeAnalysis(meetingId: string, type: 'INTERVIEW_ANALYSIS' | 'RESUME_ANALYSIS') {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId, userId: session.user.id },
    include: {
      resume: true,
      interviewBlueprint: true,
      messages: { orderBy: { timestamp: 'asc' } },
    }
  });

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  if (meeting.status !== 'COMPLETED') {
    throw new Error("Analysis is only available for completed meetings");
  }

  const existingAnalysis = await prisma.analysis.findUnique({
    where: { meetingId_type: { meetingId, type } }
  });

  if (existingAnalysis) {
    if (existingAnalysis.status === 'COMPLETED') {
      throw new Error("Analysis already completed. Re-runs are not allowed.");
    }
    // If it's 'PROCESSING', it might be stuck from a previous crash.
    // We allow it to be overridden and re-run.
  }

  const analysis = await prisma.analysis.upsert({
    where: { meetingId_type: { meetingId, type } },
    update: { status: 'PROCESSING', feedback: null, score: null },
    create: { meetingId, type, status: 'PROCESSING' }
  });

  return { meeting, analysis };
}

function parseGeminiResponse(responseText: string) {
  const cleanedResponse = responseText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  
  return JSON.parse(cleanedResponse);
}

export async function runInterviewAnalysis(meetingId: string): Promise<ActionResponse<AnalysisResult>> {
  let analysisRecordId: string | null = null;
  try {
    const { meeting, analysis } = await verifyAndInitializeAnalysis(meetingId, 'INTERVIEW_ANALYSIS');
    analysisRecordId = analysis.id;

    const categories = (meeting.interviewBlueprint?.categories as string[]) || [];
    const rationale = meeting.interviewBlueprint?.rationale || '';

    const systemPrompt = interviewAnalysisPrompt(
      meeting.messages.map(m => ({ role: m.sender === 'USER' ? 'user' : 'ai', content: m.content })),
      categories,
      rationale,
      meeting.roleToApply,
      meeting.requirements,
      meeting.companyName
    );

    const result = await getGeminiModel().generateContent([{ text: systemPrompt }]);
    const parsedData = parseGeminiResponse(result.response.text());

    // Update Analysis to COMPLETED
    const updated = await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        status: 'COMPLETED',
        score: parsedData.overall_score,
        feedback: JSON.stringify(parsedData)
      }
    });

    return {
      success: true,
      message: "Interview analysis completed",
      data: {
        id: updated.id,
        type: updated.type,
        status: 'COMPLETED',
        score: updated.score,
        feedback: parsedData
      } as AnalysisResult
    };
  } catch (error) {
    console.error("Error in runInterviewAnalysis:", error);
    if (analysisRecordId) {
      await prisma.analysis.update({
        where: { id: analysisRecordId },
        data: { status: 'FAILED', feedback: error instanceof Error ? error.message : String(error) }
      });
    }
    return {
      success: false,
      message: "Failed to run interview analysis",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function runResumeAnalysis(meetingId: string): Promise<ActionResponse<AnalysisResult>> {
  let analysisRecordId: string | null = null;
  try {
    const { meeting, analysis } = await verifyAndInitializeAnalysis(meetingId, 'RESUME_ANALYSIS');
    analysisRecordId = analysis.id;

    if (!meeting.resume?.s3Key) {
      throw new Error("No resume found for this meeting");
    }

    const resumeBuffer = await getResumeBufferFromS3(meeting.resume.s3Key);
    const resumeBase64 = resumeBuffer.toString('base64');

    const systemPrompt = resumeAnalysisPrompt(
      meeting.roleToApply,
      meeting.requirements,
      meeting.companyName
    );

    const result = await getGeminiModel().generateContent([
      { inlineData: { data: resumeBase64, mimeType: "application/pdf" } },
      { text: systemPrompt }
    ]);
    const parsedData = parseGeminiResponse(result.response.text());

    const updated = await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        status: 'COMPLETED',
        score: parsedData.score,
        feedback: JSON.stringify(parsedData)
      }
    });

    return {
      success: true,
      message: "Resume analysis completed",
      data: {
        id: updated.id,
        type: updated.type,
        status: 'COMPLETED',
        score: updated.score,
        feedback: parsedData
      } as AnalysisResult
    };
  } catch (error) {
    console.error("Error in runResumeAnalysis:", error);
    if (analysisRecordId) {
      await prisma.analysis.update({
        where: { id: analysisRecordId },
        data: { status: 'FAILED', feedback: error instanceof Error ? error.message : String(error) }
      });
    }
    return {
      success: false,
      message: "Failed to run resume analysis",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
