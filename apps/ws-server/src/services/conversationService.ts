export type ConversationMessage = {
  role: "user" | "assistant";
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

  getHistory() {
    return this.messages;
  }
}
