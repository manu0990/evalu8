import "dotenv/config";

const optionalEnv = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

const optionalNumber = (value: string | undefined, defaultValue: number) => {
  return value ? Number(value) : defaultValue;
};

const config = {
  wsPort: optionalEnv("WS_PORT"),
  llmApiKey: optionalEnv("LLM_API_KEY"),
  llmModel: optionalEnv("LLM_MODEL"),
  llmBaseUrl: optionalEnv("LLM_BASE_URL"),
  llmTemperature: optionalNumber(
    optionalEnv("LLM_TEMPERATURE"),
    0.7
  ),
  llmMaxTokens: optionalNumber(optionalEnv("LLM_MAX_TOKENS"), 2048),
};

if (!config.wsPort) throw new Error("WS_PORT is missing");
if (!config.llmModel) throw new Error("LLM_MODEL is missing");
if (!config.llmApiKey) throw new Error("LLM_API_KEY is missing");
if (Number.isNaN(config.llmTemperature)) throw new Error("LLM_TEMPERATURE must be a number");
if (Number.isNaN(config.llmMaxTokens)) throw new Error("LLM_MAX_TOKENS must be a number");

export { config };
