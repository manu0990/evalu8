'use client';

import { Wifi } from 'lucide-react';
import { Badge, Skeleton } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { use, useState, useEffect, useRef, useCallback } from 'react';
import { InterviewCard } from '@/components/interview/InterviewCard';
import { ControllerDock } from '@/components/interview/ControllerDock';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { getMeetingMessages } from '@/actions/getMeetingMessages';
import { cancelMeeting } from '@/actions/cancelMeeting';
import { toast } from 'sonner';

import axios from 'axios';

const SAMPLE_RATE = 44100;
type WindowWithWebKitAudioContext = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

interface AudioContextWithSinkId extends AudioContext {
  setSinkId(sinkId: string): Promise<void>;
}

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.id;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCaptionOn, setIsCaptionOn] = useState(false);
  const {
    mics,
    speakers,
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker
  } = useMediaDevices();

  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "speaking">("idle");

  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isReceivingRef = useRef(false);
  const connectionSeqRef = useRef(0);
  const lastAudioChunksRef = useRef<ArrayBuffer[]>([]);
  const isReconnectingRef = useRef(false);

  const router = useRouter();

  // ── Fetch existing messages on mount ──
  useEffect(() => {
    async function fetchMessages() {
      const res = await getMeetingMessages(meetingId);
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    }
    fetchMessages();
  }, [meetingId]);

  // ── Handle Media Devices (Extracted to hook) ──

  // ── Microphone capture: sends binary audio chunks to WS ──
  const { stream } = useMicrophone(wsRef.current, isMicOn && isConnected, selectedMic);

  // ── Apply Speaker Output Selection ──
  useEffect(() => {
    if (audioCtxRef.current && selectedSpeaker && 'setSinkId' in audioCtxRef.current) {
      (audioCtxRef.current as AudioContextWithSinkId).setSinkId(selectedSpeaker).catch(console.error);
    }
    }, [selectedSpeaker]);

  // ── Audio playback for binary TTS chunks from WS server ──
  const initAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as WindowWithWebKitAudioContext).webkitAudioContext;
      if (!Ctx) {
        throw new Error("AudioContext is not supported in this browser");
      }

      audioCtxRef.current = new Ctx({ sampleRate: SAMPLE_RATE });
      nextStartTimeRef.current = audioCtxRef.current.currentTime;

      // Create a gain node for mute control
      const gainNode = audioCtxRef.current.createGain();
      gainNode.connect(audioCtxRef.current.destination);
      gainNodeRef.current = gainNode;
    }
  }, []);

  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    source.connect(gainNodeRef.current!);

    const startTime = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buf.duration;

    // Clear isPlaying and notify backend after audio finishes
    if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    playbackTimeoutRef.current = setTimeout(() => {
      if (audioCtx.currentTime >= nextStartTimeRef.current - 0.1) {
        setIsPlaying(false);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "playback_finished" }));
        }
      }
    }, Math.max(0, nextStartTimeRef.current - audioCtx.currentTime) * 1000);
  }, [initAudioCtx]);

  const onRepeatQuestion = useCallback(() => {
    if (isPlaying || lastAudioChunksRef.current.length === 0) return;
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "playback_started" }));
    }
    
    toast.info("Replaying last question");
    
    if (audioCtxRef.current) {
      nextStartTimeRef.current = audioCtxRef.current.currentTime;
    }
    
    lastAudioChunksRef.current.forEach(chunk => playAudioChunk(chunk));
  }, [isPlaying, playAudioChunk]);

  // ── Sync mute state with gain node ──
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isAudioOn ? 1 : 0;
    }

     
  }, [isAudioOn]);

  // ── Connect to WS server ──
  const connectWS = useCallback(async () => {
    const connectionId = ++connectionSeqRef.current;
    let ws: WebSocket | null = null;

    const isCurrentConnection = () => (
      connectionSeqRef.current === connectionId &&
      wsRef.current === ws
    );

    try {
      // Get a one-time ticket
      const { data } = await axios.get(`/api/ws/ticket?meetingId=${meetingId}`);
      const ticketId = data.ticketId;

      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL!;
      const wsUrl = `${wsBaseUrl}?ticket=${ticketId}&meetingId=${meetingId}`;

      if (connectionSeqRef.current !== connectionId) {
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

        if (isReconnectingRef.current) {
          // Reconnect: don't add a new empty AI message — the server will send the greeting
          isReconnectingRef.current = false;
          toast.success('Reconnected successfully');
        }

        // The server will auto-send an introductory AI message
        setAiStatus('speaking');
        setMessages(prev => [...prev, { role: 'ai', content: '' }]);
        isReceivingRef.current = true;
      };

      ws.onmessage = (event) => {
        if (!isCurrentConnection()) return;

        // Binary message = TTS audio chunk
        if (event.data instanceof ArrayBuffer) {
          lastAudioChunksRef.current.push(event.data);
          playAudioChunk(event.data);
          return;
        }

        // Text message = JSON payload
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'text') {
            // If this is the first token of a new AI response, start a new message
            if (!isReceivingRef.current) {
              setMessages(prev => [...prev, { role: 'ai', content: '' }]);
              isReceivingRef.current = true;
              setAiStatus('speaking');
              setLiveTranscript('');
              lastAudioChunksRef.current = [];
            }
            // Append token to the last AI message
            setMessages(prev => {
              if (prev.length === 0) return prev;
              const newMessages = [...prev];
              const lastIdx = newMessages.length - 1;
              const lastMessage = newMessages[lastIdx];
              if (lastMessage && lastMessage.role === 'ai') {
                newMessages[lastIdx] = { ...lastMessage, content: lastMessage.content + msg.data };
              }
              return newMessages;
            });
          } else if (msg.type === 'done') {
            setAiStatus('idle');
            isReceivingRef.current = false;
          } else if (msg.type === 'replace_last_ai_message') {
            setMessages(prev => {
              const newMessages = [...prev];
              for (let i = newMessages.length - 1; i >= 0; i--) {
                const currentMsg = newMessages[i];
                if (currentMsg && currentMsg.role === 'ai') {
                  newMessages[i] = { role: 'ai', content: msg.data };
                  break;
                }
              }
              return newMessages;
            });
          } else if (msg.type === 'grace_period') {
            toast.info("Interview ending soon. You can say your final words...", { duration: 15000 });
          } else if (msg.type === 'user_message') {
            // The backend sends the full accumulated user message
            setMessages(prev => [...prev, { role: 'user', content: msg.data }]);
            setLiveTranscript('');
            setAiStatus('thinking');
          } else if (msg.type === 'meeting_completed') {
            toast.success("The interview has concluded. Thank you!");
            if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
            }
            if (audioCtxRef.current) {
              void audioCtxRef.current.close().catch(() => undefined);
              audioCtxRef.current = null;
            }
            stream?.getTracks().forEach(t => t.stop());
            router.push(`/analytics/${meetingId}`);
          } else if (msg.type === 'stt_status') {
            if (msg.data === 'error') {
              console.error('Deepgram STT Error:', msg.error);
            }
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      ws.onclose = () => {
        if (!isCurrentConnection()) return;

        setIsConnected(false);
        setAiStatus('idle');
      };

      ws.onerror = (err) => {
        if (!isCurrentConnection()) return;
        console.error('WebSocket error:', err);
      };
    } catch (err) {
      if (connectionSeqRef.current !== connectionId) return;
      console.error('Failed to connect to WS server:', err);
      toast.error('Failed to connect. Try reconnecting from the menu.');
    }

    return () => {
      connectionSeqRef.current += 1;
      if (ws) {
        ws.close();
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, playAudioChunk]);

  // ── Initial WS connection on mount ──
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    connectWS().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      cleanupFn?.();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => undefined);
        audioCtxRef.current = null;
      }
    };
  }, [connectWS]);



  const onEndInterview = async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioCtxRef.current) {
      await audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    stream?.getTracks().forEach(t => t.stop());
    await cancelMeeting(meetingId);
    router.push("/meetings");
  }

  const onTakeBreak = async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioCtxRef.current) {
      await audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    stream?.getTracks().forEach(t => t.stop());
    router.push("/meetings");
  }

  // ── Reconnect handler ──
  const onReconnect = useCallback(async () => {
    // Tear down existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioCtxRef.current) {
      await audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }

    setIsConnected(false);
    setAiStatus('idle');
    isReceivingRef.current = false;
    isReconnectingRef.current = true;
    setIsSyncing(true);

    toast.info('Reconnecting...');

    // Reset local messages to DB state to prevent duplicate AI questions stacking in UI
    const res = await getMeetingMessages(meetingId);
    if (res.success && res.messages) {
      setMessages(res.messages);
    }
    setIsSyncing(false);

    // Re-establish connection
    await connectWS();
  }, [connectWS, meetingId]);

  // ── Re-sync transcript handler ──
  const onResyncTranscript = useCallback(async () => {
    setIsSyncing(true);
    toast.info('Syncing transcript...');
    const res = await getMeetingMessages(meetingId);
    if (res.success && res.messages) {
      setMessages(prev => {
        const dbMessages = res.messages!;
        const lastCurrent = prev[prev.length - 1];
        
        // If the client has an active AI message that isn't in the DB yet
        if (lastCurrent && lastCurrent.role === 'ai') {
          // Check if the DB messages already have this as the last message
          const lastDb = dbMessages[dbMessages.length - 1];
          if (!lastDb || lastDb.content !== lastCurrent.content) {
            return [...dbMessages, lastCurrent];
          }
        }
        return dbMessages;
      });
      toast.success('Transcript synced');
    } else {
      toast.error('Failed to sync transcript');
    }
    setIsSyncing(false);
  }, [meetingId]);

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
            <InterviewCard type="user" isSpeaking={isMicOn && !isPlaying} stream={stream} />
          </div>
        ) : (
          /* Caption/Chat State: Split View */
          <div className="flex w-full max-w-7xl gap-6 h-[75vh]">

            {/* Left: Chat/Transcript Area */}
            <div className="flex-1 rounded-3xl border border-border bg-card p-6 flex flex-col relative overflow-hidden backdrop-blur-sm">

              <div className="flex-1 overflow-y-auto space-y-6 pr-4 pb-4 mask-image-b">
                {isSyncing ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0 border border-border" />
                        <div className="space-y-3 flex-1 pt-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-16 w-full max-w-[80%]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <div key={idx} className="flex gap-4">
                        {msg.role === 'ai' ? (
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                            <span className="text-xs font-bold text-primary">AI</span>
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
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

                    {liveTranscript && (
                      <div className="flex gap-4 opacity-60">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
                          <span className="text-xs font-bold text-secondary-foreground">ME</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Listening...
                          </p>
                          <p className="text-muted-foreground/70 leading-relaxed text-lg whitespace-pre-wrap italic">{liveTranscript}</p>
                        </div>
                      </div>
                    )}

                    {aiStatus === 'thinking' && (
                      <div className="flex gap-4 opacity-50">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
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
                  </>
                )}
              </div>



            </div>

            {/* Right: Stacked Videos */}
            <div className="w-80 flex flex-col gap-4">
              <InterviewCard type="ai" isSpeaking={isPlaying} className="flex-1" />
              <InterviewCard type="user" isSpeaking={isMicOn && !isPlaying} stream={stream} className="flex-1" />
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
        mics={mics}
        speakers={speakers}
        onTakeBreak={onTakeBreak}
        onEndInterview={onEndInterview}
        onRepeatQuestion={onRepeatQuestion}
        onReconnect={onReconnect}
        onResyncTranscript={onResyncTranscript}
      />

    </main>
  );
}
