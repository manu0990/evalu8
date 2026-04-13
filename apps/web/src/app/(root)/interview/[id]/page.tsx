'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { Wifi, Send } from 'lucide-react';
import { Badge } from '@repo/ui';
import { InterviewCard } from '@/components/interview/InterviewCard';
import { ControllerDock } from '@/components/interview/ControllerDock';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const SAMPLE_RATE = 44100;
type WindowWithWebKitAudioContext = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.id;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCaptionOn, setIsCaptionOn] = useState(false);
  const [selectedMic, setSelectedMic] = useState("Default Microphone");
  const [selectedSpeaker, setSelectedSpeaker] = useState("Default Speaker");

  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "speaking">("idle");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isReceivingRef = useRef(false);
  const connectionSeqRef = useRef(0);

  const router = useRouter();

  // ── Audio playback for binary TTS chunks from WS server ──
  const initAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as WindowWithWebKitAudioContext).webkitAudioContext;
      if (!Ctx) {
        throw new Error("AudioContext is not supported in this browser");
      }

      audioCtxRef.current = new Ctx({ sampleRate: SAMPLE_RATE });
      nextStartTimeRef.current = audioCtxRef.current.currentTime;
    }
  }, []);

  const playAudioChunk = useCallback((audioData: ArrayBuffer) => {
    initAudioCtx();
    const audioCtx = audioCtxRef.current!;

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    setIsPlaying(true);

    if (nextStartTimeRef.current < audioCtx.currentTime) {
      nextStartTimeRef.current = audioCtx.currentTime;
    }

    const aligned = new ArrayBuffer(audioData.byteLength);
    new Uint8Array(aligned).set(new Uint8Array(audioData));
    const floats = new Float32Array(aligned);

    const buf = audioCtx.createBuffer(1, floats.length, SAMPLE_RATE);
    buf.getChannelData(0).set(floats);

    const source = audioCtx.createBufferSource();
    source.buffer = buf;
    source.connect(audioCtx.destination);

    const startTime = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buf.duration;

    // Clear isPlaying after audio finishes
    setTimeout(() => {
      if (audioCtx.currentTime >= nextStartTimeRef.current - 0.1) {
        setIsPlaying(false);
      }
    }, Math.max(0, nextStartTimeRef.current - audioCtx.currentTime) * 1000);
  }, [initAudioCtx]);

  // ── Connect to WS server ──
  useEffect(() => {
    let ws: WebSocket | null = null;
    let didCancel = false;
    const connectionId = ++connectionSeqRef.current;

    const isCurrentConnection = () => (
      !didCancel &&
      connectionSeqRef.current === connectionId &&
      wsRef.current === ws
    );

    async function connectWS() {
      try {
        // Get a one-time ticket
        const { data } = await axios.get(`/api/ws/ticket?meetingId=${meetingId}`);
        const ticketId = data.ticketId;

        const wsBaseUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL!;
        const wsUrl = `${wsBaseUrl}?ticket=${ticketId}&meetingId=${meetingId}`;

        if (didCancel || connectionSeqRef.current !== connectionId) {
          return;
        }

        ws = new WebSocket(wsUrl);
        ws.binaryType = 'arraybuffer';
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isCurrentConnection()) {
            ws?.close();
            return;
          }

          console.log('WebSocket connected');
          setIsConnected(true);
          // The server will auto-send an introductory AI message
          setAiStatus('speaking');
          setMessages(prev => [...prev, { role: 'ai', content: '' }]);
          isReceivingRef.current = true;
        };

        ws.onmessage = (event) => {
          if (!isCurrentConnection()) return;

          // Binary message = TTS audio chunk
          if (event.data instanceof ArrayBuffer) {
            playAudioChunk(event.data);
            return;
          }

          // Text message = JSON payload
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'text') {
              // Append token to the last AI message
              setMessages(prev => {
                if (prev.length === 0) return prev;
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'ai') {
                  lastMessage.content += msg.data;
                }
                return newMessages;
              });
            } else if (msg.type === 'done') {
              setAiStatus('idle');
              isReceivingRef.current = false;
            }
          } catch (err) {
            console.error('Failed to parse WS message:', err);
          }
        };

        ws.onclose = () => {
          if (!isCurrentConnection()) return;

          console.log('WebSocket disconnected');
          setIsConnected(false);
          setAiStatus('idle');
        };

        ws.onerror = (err) => {
          if (!isCurrentConnection()) return;
          console.error('WebSocket error:', err);
        };
      } catch (err) {
        if (didCancel || connectionSeqRef.current !== connectionId) return;
        console.error('Failed to connect to WS server:', err);
      }
    }

    connectWS();

    return () => {
      didCancel = true;
      if (connectionSeqRef.current === connectionId) {
        connectionSeqRef.current += 1;
      }
      if (ws) {
        ws.close();
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => undefined);
        audioCtxRef.current = null;
      }
    };
  }, [meetingId, playAudioChunk]);

  // ── Send user message via WebSocket ──
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || aiStatus !== 'idle' || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiStatus('thinking');

    // Add a placeholder for the AI response
    setMessages(prev => [...prev, { role: 'ai', content: '' }]);
    isReceivingRef.current = true;

    // Send message to WS server
    wsRef.current.send(userMessage);

    // The response will come back via ws.onmessage
    setAiStatus('speaking');
  };

  const onEndInterview = async () => {
    console.log("End initiated");
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioCtxRef.current) {
      await audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    router.push("/meetings");
    console.log("Ended");
  }

  return (
    <main className="relative flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 pl-8">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 bg-background/50 backdrop-blur-md border-border text-muted-foreground">
            <div className={`h-2 w-2 rounded-full ${aiStatus === 'speaking' || aiStatus === 'thinking' ? 'bg-green-500 animate-pulse' : isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {aiStatus === 'speaking' ? 'Speaking...' : aiStatus === 'thinking' ? 'Thinking...' : isConnected ? 'Online' : 'Connecting...'}
          </Badge>
          <Badge variant="outline" className="gap-1.5 bg-background/50 backdrop-blur-md border-border text-muted-foreground">
            <Wifi className="h-3.5 w-3.5" />
            {isConnected ? 'Stable' : 'Connecting'}
          </Badge>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 w-full p-6 flex items-center justify-center relative">

        {/* Conditional Layout */}
        {!isCaptionOn ? (
          /* Default State: Large Central Video Cards */
          <div className="grid grid-cols-2 gap-6 w-full max-w-6xl aspect-video max-h-[70vh]">
            <InterviewCard type="ai" isSpeaking={isPlaying} />
            <InterviewCard type="user" isSpeaking={isMicOn} />
          </div>
        ) : (
          /* Caption/Chat State: Split View */
          <div className="flex w-full max-w-7xl gap-6 h-[75vh]">

            {/* Left: Chat/Transcript Area */}
            <div className="flex-1 rounded-3xl border border-border bg-card p-6 flex flex-col relative overflow-hidden backdrop-blur-sm">

              <div className="flex-1 overflow-y-auto space-y-6 pr-4 pb-4 mask-image-b">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    {msg.role === 'ai' ? (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                        <span className="text-xs font-bold text-primary">AI</span>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                        <span className="text-xs font-bold text-secondary-foreground">ME</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-primary">
                        {msg.role === 'ai' ? 'AI Interviewer' : 'You'}
                      </p>
                      <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {aiStatus === 'thinking' && (
                  <div className="flex gap-4 opacity-50">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">AI</span>
                    </div>
                    <div className="space-y-1 pt-2">
                      <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSend} className="mt-4 flex gap-3 pt-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={aiStatus !== 'idle'}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || aiStatus !== 'idle'}
                  className="bg-primary text-primary-foreground h-12 w-12 rounded-xl flex items-center justify-center disabled:opacity-50 transition-opacity"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>

            </div>

            {/* Right: Stacked Videos */}
            <div className="w-80 flex flex-col gap-4">
              <InterviewCard type="ai" isSpeaking={isPlaying} className="flex-1" />
              <InterviewCard type="user" isSpeaking={isMicOn} className="flex-1" />
            </div>
          </div>
        )}

      </div>

      {/* Bottom Dock */}
      <ControllerDock
        isMicOn={isMicOn}
        setIsMicOn={setIsMicOn}
        isAudioOn={isAudioOn}
        setIsAudioOn={setIsAudioOn}
        isCaptionOn={isCaptionOn}
        setIsCaptionOn={setIsCaptionOn}
        selectedMic={selectedMic}
        setSelectedMic={setSelectedMic}
        selectedSpeaker={selectedSpeaker}
        setSelectedSpeaker={setSelectedSpeaker}
        onEndInterview={onEndInterview}
      />

    </main>
  );
}
