import "dotenv/config";

const config = {
  wsPort: process.env.WS_PORT,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  model: process.env.LLM_MODEL || "",
};

if (!config.wsPort) throw new Error("WS_PORT is missing");
if (!config.model) throw new Error("LLM_MODEL is missing");
if (!config.geminiApiKey) throw new Error("GEMINI_API_KEY is missing");

export { config };