import { Content } from "@google/genai";
import { gemini } from "../utils/aiClients";
import { config } from "../ws-env.config";

export async function streamCompletion(messages: Content[]) {
  return gemini.models.generateContentStream({
    model: config.model,
    contents: messages,
    config: {
      systemInstruction: "You are a helpful assistant.",
    }
  });
}