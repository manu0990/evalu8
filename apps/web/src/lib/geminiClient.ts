import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.WEB_LLM_API_KEY) {
  throw new Error("WEB_LLM_API_KEY environment variable is not set");
}
if (!process.env.WEB_LLM_MODEL) {
  throw new Error("WEB_LLM_MODEL environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.WEB_LLM_API_KEY);

const geminiModel = genAI.getGenerativeModel({
  model: process.env.WEB_LLM_MODEL
});

export { genAI, geminiModel };
