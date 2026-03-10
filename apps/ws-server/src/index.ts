import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import { parse } from "url";
import { Conversation } from "./services/conversationService";
import { streamCompletion } from "./services/geminiService";
import { config } from "./ws-env.config";
import { prisma } from "@repo/db";

// Extend WebSocket interface to hold user data
interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  meetingId?: string;
}

export function startWebSocketServer() {
  const server = http.createServer();
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    try {
      const { query } = parse(request.url || "", true);
      const ticketId = query.ticket as string;
      const meetingId = query.meetingId as string;

      if (!ticketId || !meetingId) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      // Check if ticket exists in DB and is valid
      const ticket = await prisma.wsTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      if (ticket.meetingId !== meetingId) {
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
        socket.destroy();
        return;
      }

      if (ticket.expiresAt < new Date()) {
        socket.write("HTTP/1.1 401 Unauthorized - Ticket Expired\r\n\r\n");
        await prisma.wsTicket.delete({ where: { id: ticketId } }); // Cleanup expired ticket
        socket.destroy();
        return;
      }

      console.log("Deleting ticket");
      // Valid ticket found! Delete it so it can't be reused
      try {
        await prisma.wsTicket.delete({ where: { id: ticketId } });
        console.log("log deleted");
      } catch (err: any) {
        if (err.code === 'P2025') {
          console.warn("Ticket already deleted by another concurrent request.");
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }
        throw err;
      }

      wss.handleUpgrade(request, socket, head, (ws: AuthenticatedWebSocket) => {
        console.log("Connection being upgraded.");

        ws.userId = ticket.userId;
        ws.meetingId = ticket.meetingId;
        wss.emit("connection", ws, request);
      });
    } catch (error) {
      console.error("WS upgrade error:", error);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  });

  wss.on("connection", (socket: AuthenticatedWebSocket) => {
    console.log(`Client connected for meeting ${socket.meetingId} (User: ${socket.userId})`);

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
      console.log(`Client disconnected from meeting ${socket.meetingId}`);
    });
  });

  server.listen(Number(config.wsPort), () => {
    console.log(`Secured WS server running on ws://localhost:${config.wsPort}`);
  });
}