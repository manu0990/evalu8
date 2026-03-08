import { WebSocketServer, WebSocket } from "ws";
import { Conversation } from "./services/conversationService";
import { streamCompletion } from "./services/geminiService";
import { config } from "./ws-env.config";

export function startWebSocketServer() {

  const wss = new WebSocketServer({ port: Number(config.wsPort) });

  wss.on("connection", (socket: WebSocket) => {
    console.log("Client connected");

    const conversation = new Conversation();

    socket.on("message", async (data) => {
      const userMessage = data.toString();

      conversation.addUserMessage(userMessage);

      const stream = await streamCompletion(conversation.getHistory());

      let assistantResponse = "";

      for await (const chunk of stream) {
        if (socket.readyState !== WebSocket.OPEN) break;

        // const token = chunk.choices[0]?.delta?.content || "";
        const token = chunk.text || "";

        if (token) {
          assistantResponse += token;
          socket.send(token);
        }
      }

      conversation.addAssistantMessage(assistantResponse);

      socket.send("[DONE]");
    });

    socket.on("close", () => {
      console.log("Client disconnected");
    });
  });

  console.log(`WS server running on ws://localhost:${config.wsPort}`);
}