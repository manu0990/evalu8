export type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export class Conversation {
  private messages: ConversationMessage[];

  constructor() {
    this.messages = [];
  }

  addUserMessage(content: string) {
    this.messages.push({ role: "user", content });
  }

  addAssistantMessage(content: string) {
    this.messages.push({ role: "assistant", content });
  }

  addSystemMessage(content: string) {
    this.messages.push({ role: "system", content });
  }

  getHistory() {
    return this.messages;
  }
}
