"use server";

import { getGeminiModel } from "@/lib/geminiClient";
import { blueprintPrompt } from "@/lib/prompts/blueprintPrompt";
import { getResumeBufferFromS3 } from "@/lib/s3ResumeReader";

interface BlueprintCategory {
  type: string;
  target: number;
}

interface BlueprintResponse {
  total_questions: number;
  categories: BlueprintCategory[];
  rationale: string;
  initial_notes: string;
}

export async function generateBlueprint(
  resumeS3Key: string,
  companyName: string,
  companyWebsite: string | null,
  roleToApply: string,
  requirements: string
): Promise<BlueprintResponse> {
  try {
    // fetch resume buffer from S3 and convert to base64
    const resume = await getResumeBufferFromS3(resumeS3Key).then(buffer => buffer.toString('base64'));

    // create the system prompt
    const systemPrompt = blueprintPrompt(
      companyName,
      companyWebsite,
      roleToApply,
      requirements
    );

    // call Gemini AI with the resume PDF and prompt
    const result = await getGeminiModel().generateContent([
      {
        inlineData: {
          data: resume,
          mimeType: "application/pdf",
        },
      },
      { text: systemPrompt },
    ]);

    const response = result.response.text();

    // parse the JSON response
    let blueprint: BlueprintResponse;
    try {
      // clean up the response text (remove markdown code blocks if present)
      const cleanedResponse = response
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      blueprint = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(`[generateBlueprint] Failed to parse AI response:`, parseError);
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

    // validate the blueprint structure
    if (
      typeof blueprint.total_questions !== "number" ||
      !Array.isArray(blueprint.categories) ||
      typeof blueprint.rationale !== "string" ||
      typeof blueprint.initial_notes !== "string"
    ) {
      throw new Error("Invalid blueprint structure from AI");
    }

    // validate that categories sum to total_questions
    const categorySum = blueprint.categories.reduce((sum, cat) => sum + cat.target, 0);
    if (categorySum !== blueprint.total_questions) {
      console.error(`[generateBlueprint] Category sum mismatch: ${categorySum} !== ${blueprint.total_questions}`);
      throw new Error(`Category targets (${categorySum}) do not sum to total_questions (${blueprint.total_questions})`);
    }

    return blueprint;
  } catch (error) {
    console.error(`[generateBlueprint] Error generating blueprint:`, error);
    throw error;
  }
}
