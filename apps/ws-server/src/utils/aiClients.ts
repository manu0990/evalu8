import OpenAI from "openai";
import { config } from "../ws-env.config";

export const llm = new OpenAI({
  apiKey: config.llmApiKey,
  baseURL: config.llmBaseUrl,
});
