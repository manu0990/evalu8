import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import { parse } from "url";
import { Conversation } from "./services/conversationService";
import { streamCompletion } from "./services/llmService";
import { config } from "./ws-env.config";
import { prisma } from "@repo/db";
import { TTSService } from "./services/ttsService";
import { STTService } from "./services/sttService";

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

      // Valid ticket found! Delete it so it can't be reused
      try {
        await prisma.wsTicket.delete({ where: { id: ticketId } });
      } catch (err) {
        const errorCode =
          typeof err === "object" && err !== null && "code" in err ? err.code : undefined;

        if (errorCode === "P2025") {
          console.warn("Ticket already deleted by another concurrent request.");
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }
        throw err;
      }

      wss.handleUpgrade(request, socket, head, (ws: AuthenticatedWebSocket) => {
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

  wss.on("connection", async (socket: AuthenticatedWebSocket) => {

    const conversation = new Conversation();
    const tts = new TTSService(socket);
    const ttsReady = tts.init()
      .then(() => true)
      .catch((err) => {
        console.error("Failed to initialize TTS:", err);
        return false;
      });

    // ── Accumulate final transcript segments until speech_final ──
    let pendingTranscript = "";
    let isAiSpeaking = false;

    const stt = new STTService({
      onTranscript: ({ transcript, isFinal, speechFinal }) => {
        // If the AI is currently speaking, enforce strict turn-taking by ignoring user input
        if (isAiSpeaking) return;

        // We now wait for the turn to complete before updating the UI

        // Accumulate final segments
        if (isFinal && transcript.trim()) {
          pendingTranscript += (pendingTranscript ? " " : "") + transcript.trim();
        }

        // When the speaker pauses (speech_final), send accumulated text to LLM
        if (speechFinal && pendingTranscript.trim() && !isAiSpeaking) {
          const userMessage = pendingTranscript.trim();
          pendingTranscript = "";

          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "user_message", data: userMessage }));
          }

          conversation.addUserMessage(userMessage);
          isAiSpeaking = true;
          // The stream ends quickly because Cartesia generates audio faster than real-time.
          // We rely on the frontend's 'playback_finished' event to toggle isAiSpeaking to false.
          streamAIResponse().catch((err) => console.error("Stream error after STT:", err));
        }
      },
    });

    let isSttReady = false;
    const pendingAudioQueue: Buffer[] = [];
    
      stt.init()
        .then(() => {
          isSttReady = true;
        // Flush the queue immediately in order
        while (pendingAudioQueue.length > 0) {
          const chunk = pendingAudioQueue.shift();
          if (chunk) stt.sendAudio(chunk);
        }
      })
        .catch((err) => {
          console.error("[STT] Failed to initialize:", err);
        });

    // ── Fetch meeting context from DB ──
    let systemInstruction = "You are a helpful assistant conducting an interview.";

    try {
      const meeting = await prisma.meeting.findUnique({
        where: { id: socket.meetingId },
        include: {
          resume: true,
          interviewBlueprint: true,
        },
      });

      if (meeting) {
        systemInstruction = [
          `You are Evalu8, a professional and friendly AI interviewer conducting a mock interview.`,
          ``,
          `## Interview Context`,
          `- **Company**: ${meeting.companyName}${meeting.companyWebsite ? ` (${meeting.companyWebsite})` : ""}`,
          `- **Role**: ${meeting.roleToApply}`,
          `- **Job Requirements**: ${meeting.requirements}`,
          ``,
          `## Your Behavior`,
          `- Start the conversation with a warm, professional greeting. Introduce yourself briefly, mention the company and role, and ask an easy opening question (e.g. "Tell me a little about yourself and what drew you to this role").`,
          `- Ask one question at a time. Wait for the candidate's response before moving on.`,
          `- Adapt follow-up questions based on the candidate's answers.`,
          `- Cover a mix of behavioral, technical, and situational questions relevant to the role and requirements.`,
          `- Be encouraging but professional. Keep your responses concise.`,
          `- Keep each turn to 1-3 short sentences unless the candidate asks for detail.`,
          `- Do not repeat your greeting once the interview has started.`,
          `- Do not mention that you cannot access a PDF. Use the resume/interviewer notes below as your resume context.`,
          `- Do NOT use markdown formatting or JSON in your responses. Speak naturally as you would in a real interview.`,
          `- Resume file: ${meeting.resume?.name || "not available"}`,
          meeting.interviewBlueprint
            ? `\n## Interview Blueprint\n- Total questions planned: ${meeting.interviewBlueprint.totalQuestions}\n- Categories: ${JSON.stringify(meeting.interviewBlueprint.categories)}\n- Rationale: ${meeting.interviewBlueprint.rationale}\n- Interviewer notes from resume analysis: ${meeting.interviewBlueprint.initialNotes}`
            : "",
        ].join("\n");
      }
    } catch (err) {
      console.error("Failed to fetch meeting details:", err);
      // Fall back to default system instruction
    }

    // ── Helper: stream an AI response and send text + TTS to the client ──
    async function streamAIResponse() {
      const ttsStarted = ttsReady.then(async (enabled) => {
        if (!enabled) return false;

        await tts.beginResponse();
        return true;
      }).catch((err) => {
        console.error("Failed to start TTS response:", err);
        return false;
      });

      const queueTtsText = (text: string) => {
        void ttsStarted.then((enabled) => {
          if (enabled) {
            tts.pushText(text);
          }
        });
      };

      let assistantResponse = "";
      let phraseBuffer = "";

      try {
        const stream = await streamCompletion(
          conversation.getHistory(),
          systemInstruction
        );

        for await (const chunk of stream) {
          if (socket.readyState !== WebSocket.OPEN) break;

          const token = chunk;

          if (!token) continue;

          assistantResponse += token;
          phraseBuffer += token;

          // send text token immediately
          socket.send(
            JSON.stringify({
              type: "text",
              data: token,
            })
          );

          // sentence boundary detection
          if (/[.!?]\s*$/.test(phraseBuffer) || phraseBuffer.length > 80) {
            queueTtsText(phraseBuffer);
            phraseBuffer = "";
          }
        }

        if (phraseBuffer.length > 0) {
          queueTtsText(phraseBuffer);
        }
      } finally {
        // Close this response's TTS context so the next one gets a fresh stream
        if (await ttsStarted) {
          await tts.endResponse();
        }
      }

      if (assistantResponse.trim()) {
        conversation.addAssistantMessage(assistantResponse);
      }

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "done",
          })
        );
      }
    }

    // ── Send introductory greeting on connect ──
    try {
      // Seed the conversation with a prompt that triggers the AI's opening
      conversation.addUserMessage(
        "The interview is starting now. Please greet the candidate and begin with your opening question."
      );

      isAiSpeaking = true;
      // We start the greeting but don't reset isAiSpeaking immediately.
      // The frontend will send 'playback_finished' when the audio completes.
      await streamAIResponse();
    } catch (err) {
      console.error("Failed to send intro greeting:", err);
      isAiSpeaking = false;
    }

    // ── Handle subsequent messages ──
    socket.on("message", async (data, isBinary) => {
      if (isBinary) {
        // Binary frame = audio chunk from microphone → forward to Deepgram
        if (isSttReady) {
          stt.sendAudio(data as Buffer);
        } else {
          pendingAudioQueue.push(data as Buffer);
        }
      } else {
        // Text frame = control messages from client
        try {
          const msg = JSON.parse(data.toString());

          if (msg.type === "playback_finished") {
            // The frontend finished playing the AI's audio chunks. Turn-taking resumes.
            isAiSpeaking = false;
          } else if (msg.type === "user_message") {
            // Fallback text input (if ever needed)
            conversation.addUserMessage(msg.data);
            await streamAIResponse();
          }
        } catch (err) {
          console.error("Failed to parse control message:", err);
        }
      }
    });

    socket.on("close", async () => {
      if (isSttReady) {
        stt.close();
      }
      if (await ttsReady) {
        await tts.close();
      }
      console.log(`Client disconnected`);
    });
  });

  server.listen(Number(config.wsPort), () => {
    console.log(`Secured WS server running on ws://localhost:${config.wsPort}`);
  });
}
