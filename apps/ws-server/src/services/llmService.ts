import { config } from "../ws-env.config";
import { llm } from "../utils/aiClients";
import type { ConversationMessage } from "./conversationService";

export type StreamEvent = 
  | { type: "text"; content: string }
  | { type: "tool_call"; name: string };

export async function* streamCompletion(
  messages: ConversationMessage[],
  systemInstruction: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: any[]
): AsyncGenerator<StreamEvent> {
  const stream = await llm.chat.completions.create({
    model: config.llmModel,
    messages: [
      { role: "system", content: systemInstruction },
      ...messages,
    ],
    temperature: config.llmTemperature,
    max_tokens: config.llmMaxTokens,
    stream: true,
    tools: tools?.length ? tools : undefined,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    if (delta.content) {
      yield { type: "text", content: delta.content };
    }
    
    if (delta.tool_calls && delta.tool_calls[0]?.function?.name) {
      yield { type: "tool_call", name: delta.tool_calls[0].function.name };
    }
  }
}
