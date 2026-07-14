import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import { parse } from "url";
import { Conversation } from "./services/conversationService";
import { streamCompletion } from "./services/llmService";
import { config } from "./ws-env.config";
import { prisma } from "@repo/db";
import { TTSService } from "./services/ttsService";
import { STTService } from "./services/sttService";
import { buildSystemPrompt } from "./lib/system-prompt";
import { PrismaType } from "@repo/db";

type MeetingWithRelations = PrismaType.MeetingGetPayload<{
  include: {
    resume: true;
    interviewBlueprint: true;
    messages: {
      orderBy: { timestamp: 'asc' }
    };
  };
}>;

// Extend WebSocket interface to hold user data
interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  meetingId?: string;
  meetingData?: MeetingWithRelations;
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

      // Fetch meeting and all required context
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
          resume: true,
          interviewBlueprint: true,
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        },
      });

      if (!meeting) {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.destroy();
        return;
      }

      if (meeting.status === 'COMPLETED' || meeting.status === 'CANCELLED') {
        socket.write("HTTP/1.1 403 Forbidden - Meeting ended\r\n\r\n");
        socket.destroy();
        return;
      }

      if (meeting.status === 'QUESTIONNAIRE_READY') {
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { status: 'IN_PROGRESS' },
        });
      }

      wss.handleUpgrade(request, socket, head, (ws: AuthenticatedWebSocket) => {
        ws.userId = ticket.userId;
        ws.meetingId = ticket.meetingId;
        ws.meetingData = meeting;
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
    let lastAiMessage = "";
    let isInGracePeriod = false;
    let gracePeriodTimeout: NodeJS.Timeout | null = null;

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

          if (isInGracePeriod) {
            if (gracePeriodTimeout) clearTimeout(gracePeriodTimeout);
            prisma.message.create({
              data: {
                meetingId: socket.meetingId!,
                sender: "USER",
                content: userMessage,
              }
            }).catch(err => console.error("Failed to save final user message:", err));
            
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "meeting_completed" }));
            }
            prisma.meeting.update({
              where: { id: socket.meetingId! },
              data: { status: 'COMPLETED' },
            }).catch(console.error);
            socket.close();
            return;
          }

          conversation.addUserMessage(userMessage);
          isAiSpeaking = true;

          // Save pair to database if we have a previous AI message
          if (lastAiMessage) {
            const aiTextToSave = lastAiMessage;
            lastAiMessage = ""; // Clear it so we don't save it again
            
            // Background async save
            prisma.$transaction([
              prisma.message.create({
                data: {
                  meetingId: socket.meetingId!,
                  sender: "ASSISTANT",
                  content: aiTextToSave,
                }
              }),
              prisma.message.create({
                data: {
                  meetingId: socket.meetingId!,
                  sender: "USER",
                  content: userMessage,
                }
              })
            ]).catch(err => console.error("Failed to save message pair:", err));
          }

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
      const meeting = socket.meetingData;

      if (meeting && meeting.status === 'IN_PROGRESS') {
        meeting.messages?.forEach((msg: { sender: string; content: string }) => {
          if (msg.sender === 'USER') conversation.addUserMessage(msg.content);
          else conversation.addAssistantMessage(msg.content);
        });

        systemInstruction = buildSystemPrompt({
          companyName: meeting.companyName,
          companyWebsite: meeting.companyWebsite,
          roleToApply: meeting.roleToApply,
          requirements: meeting.requirements,
          resumeName: meeting.resume?.name || null,
          blueprint: meeting.interviewBlueprint
            ? {
                totalQuestions: meeting.interviewBlueprint.totalQuestions,
                categories: meeting.interviewBlueprint.categories as unknown,
                rationale: meeting.interviewBlueprint.rationale,
                initialNotes: meeting.interviewBlueprint.initialNotes,
              }
            : null,
        });
      }
    } catch (err) {
      console.error("Failed to fetch meeting details:", err);
      // Fall back to default system instruction
    }

    let turnCount = conversation.getHistory().filter(m => m.role === 'assistant').length;
    const totalQuestions = socket.meetingData?.interviewBlueprint?.totalQuestions || 5;
    const hardLimit = totalQuestions + 3;
    let pendingMeetingEnd = false;

    const tools = [{
      type: "function",
      function: {
        name: "end_interview",
        description: "Call this tool when the interview naturally concludes or you have asked the planned number of questions.",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              description: "The reason for ending the interview."
            }
          },
          required: ["reason"]
        }
      }
    }];

    // ── Helper: stream an AI response and send text + TTS to the client ──
    async function streamAIResponse() {
      turnCount++;

      if (turnCount === totalQuestions) {
        conversation.addSystemMessage(`SYSTEM ALERT: You have reached the planned number of questions (${totalQuestions}). Please plan to conclude the interview gracefully within the next few turns.`);
      } else if (turnCount === hardLimit - 1) {
        conversation.addSystemMessage("SYSTEM ALERT: The interview time is up. Wrap up the interview immediately in one short sentence and call the end_interview tool.");
      } else if (turnCount >= hardLimit) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "meeting_completed" }));
        }
        prisma.meeting.update({
          where: { id: socket.meetingId! },
          data: { status: 'COMPLETED' },
        }).catch(console.error);
        socket.close();
        return;
      }

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
          systemInstruction,
          tools
        );

        for await (const chunk of stream) {
          if (socket.readyState !== WebSocket.OPEN) break;

          if (chunk.type === "tool_call" && chunk.name === "end_interview") {
            pendingMeetingEnd = true;
            continue;
          }

          if (chunk.type === "text") {
            const token = chunk.content;

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
        }

        if (phraseBuffer.length > 0) {
          queueTtsText(phraseBuffer);
        }
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as Record<string, any>;
        if (error?.error?.code === 'tool_use_failed' && error?.error?.failed_generation) {
          assistantResponse = error.error.failed_generation;
        } else {
          console.error("LLM streaming error:", err);
        }
      } finally {
        const funcRegex = /<function=end_interview.*?<\/function>/gi;
        if (funcRegex.test(assistantResponse)) {
          pendingMeetingEnd = true;
          assistantResponse = assistantResponse.replace(funcRegex, '').trim();
          if (socket.readyState === WebSocket.OPEN && assistantResponse.length > 0) {
            socket.send(JSON.stringify({ 
              type: "replace_last_ai_message", 
              data: assistantResponse 
            }));
          }
        }

        if (pendingMeetingEnd && assistantResponse.trim().length === 0) {
          const fallbackMsg = "Thank you for your time. The interview is now concluded.";
          queueTtsText(fallbackMsg);
          assistantResponse = fallbackMsg;
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "text", data: fallbackMsg }));
          }
        }

        // Close this response's TTS context so the next one gets a fresh stream
        if (await ttsStarted) {
          await tts.endResponse();
        }
      }

      if (assistantResponse.trim()) {
        conversation.addAssistantMessage(assistantResponse.trim());
        lastAiMessage = assistantResponse.trim();
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
      if (conversation.getHistory().length) {
        // Resumed interview: seed the conversation with a prompt that triggers the AI to resume
        conversation.addSystemMessage("The candidate has returned from a short break. Please warmly welcome them back and resume the interview exactly where you left off. Ask your next question.");
      } else {
        // Fresh interview: seed the conversation so the AI opens with a proper interview greeting
        conversation.addUserMessage("Hello, I'm ready for the interview.");
      }

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
            if (pendingMeetingEnd) {
              isInGracePeriod = true;
              
              if (socket.readyState === WebSocket.OPEN) {
                 socket.send(JSON.stringify({ type: "grace_period" }));
              }

              if (lastAiMessage) {
                 prisma.message.create({
                    data: {
                       meetingId: socket.meetingId!,
                       sender: "ASSISTANT",
                       content: lastAiMessage,
                    }
                 }).catch(err => console.error("Failed to save AI farewell message:", err));
                 lastAiMessage = "";
              }

              gracePeriodTimeout = setTimeout(() => {
                 if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "meeting_completed" }));
                 }
                 prisma.meeting.update({
                    where: { id: socket.meetingId! },
                    data: { status: 'COMPLETED' },
                 }).catch(console.error);
                 socket.close();
              }, 20000);
            }
          } else if (msg.type === "user_message") {
            // Fallback text input (if ever needed)
            conversation.addUserMessage(msg.data);
            await streamAIResponse();
          } else if (msg.type === "playback_started") {
            // The client is replaying audio locally
            isAiSpeaking = true;
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
