import { config } from "../ws-env.config";
import { llm } from "../utils/aiClients";
import type { ConversationMessage } from "./conversationService";

export async function* streamCompletion(
  messages: ConversationMessage[],
  systemInstruction: string
): AsyncGenerator<string> {
  const stream = await llm.chat.completions.create({
    model: config.llmModel,
    messages: [
      { role: "system", content: systemInstruction },
      ...messages,
    ],
    temperature: config.llmTemperature,
    max_tokens: config.llmMaxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
      yield token;
    }
  }
}
