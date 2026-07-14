import { GoogleGenerativeAI } from "@google/generative-ai";
import { KeyRotator } from "./keyRotation";

if (!process.env.WEB_LLM_API_KEY) {
  throw new Error("WEB_LLM_API_KEY environment variable is not set");
}
if (!process.env.WEB_LLM_MODEL) {
  throw new Error("WEB_LLM_MODEL environment variable is not set");
}

const keyRotator = new KeyRotator(process.env.WEB_LLM_API_KEY);

/**
 * Returns a Gemini model instance using the next API key in rotation.
 * Call this per-request to distribute load across keys.
 */
function getGeminiModel() {
  const genAI = new GoogleGenerativeAI(keyRotator.next());
  return genAI.getGenerativeModel({ model: process.env.WEB_LLM_MODEL! });
}

export { getGeminiModel };
