import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.CLIENT_LLM_API_KEY) {
  throw new Error("CLIENT_LLM_API_KEY environment variable is not set");
}
if(!process.env.CLIENT_LLM_MODEL) {
  throw new Error("CLIENT_LLM_MODEL environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.CLIENT_LLM_API_KEY);

const geminiModel = genAI.getGenerativeModel({
  model: process.env.CLIENT_LLM_MODEL
});

export { genAI, geminiModel };