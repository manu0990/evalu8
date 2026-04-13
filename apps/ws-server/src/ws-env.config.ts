import "dotenv/config";

const optionalEnv = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

const optionalNumber = (value: string | undefined, defaultValue: number) => {
  return value ? Number(value) : defaultValue;
};

const wsPort = optionalEnv("WS_PORT");
const llmApiKey = optionalEnv("WS_LLM_API_KEY");
const llmModel = optionalEnv("WS_LLM_MODEL");
const llmBaseUrl = optionalEnv("WS_LLM_BASE_URL");
const llmTemperature = optionalNumber(optionalEnv("WS_LLM_TEMPERATURE"), 0.7);
const llmMaxTokens = optionalNumber(optionalEnv("WS_LLM_MAX_TOKENS"), 2048);
const cartesiaApiKey = optionalEnv("CARTESIA_API_KEY"); 

if (!wsPort) throw new Error("WS_PORT is missing");
if (!llmModel) throw new Error("WS_LLM_MODEL is missing");
if (!llmApiKey) throw new Error("WS_LLM_API_KEY is missing");
if (!cartesiaApiKey) throw new Error("CARTESIA_API_KEY is missing");
if (Number.isNaN(llmTemperature)) throw new Error("WS_LLM_TEMPERATURE must be a number");
if (Number.isNaN(llmMaxTokens)) throw new Error("WS_LLM_MAX_TOKENS must be a number");

const config = {
  wsPort,
  llmApiKey,
  llmModel,
  llmBaseUrl,
  llmTemperature,
  llmMaxTokens,
  cartesiaApiKey,
};

export { config };
