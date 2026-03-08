import { Content } from "@google/genai";

export class Conversation {
  messages: Content[];

  constructor() {
    this.messages = [];
  }

  addUserMessage(content: string) {
    this.messages.push({ role: "user", parts: [{ text: content }] });
  }

  addAssistantMessage(content: string) {
    this.messages.push({ role: "model", parts: [{ text: content }] });
  }

  getHistory() {
    return this.messages;
  }
}