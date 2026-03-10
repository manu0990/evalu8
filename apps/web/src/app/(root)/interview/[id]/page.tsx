'use client';

import { use, useState, useEffect, useRef } from 'react';
import { Wifi } from 'lucide-react';
import { Badge } from '@repo/ui';
import { InterviewCard } from '@/components/interview/InterviewCard';
import { ControllerDock } from '@/components/interview/ControllerDock';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.id;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCaptionOn, setIsCaptionOn] = useState(false);
  const [selectedMic, setSelectedMic] = useState("Default Microphone");
  const [selectedSpeaker, setSelectedSpeaker] = useState("Default Speaker");

  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!meetingId) {
      setWsStatus("disconnected");
      return;
    }

    let active = true;

    const connectWs = async () => {
      try {
        const res = await fetch(`/api/ws/ticket?meetingId=${meetingId}`);
        if (!res.ok) throw new Error("Failed to get ticket");
        const { ticketId } = await res.json();

        if (!active) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL;
        if (!wsUrl?.trim()) throw new Error("NEXT_PUBLIC_WS_SERVER_URL is not defined in .env");

        const ws = new WebSocket(`${wsUrl}?meetingId=${meetingId}&ticket=${ticketId}`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (active) setWsStatus("connected");
        };

        ws.onmessage = (event) => {
          // Handle incoming messages (e.g., transcripts or AI speech) here
          console.log("WS Message:", event.data);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          if (active) setWsStatus("disconnected");
        };

        ws.onclose = () => {
          console.log("WebSocket closed");
          if (active) setWsStatus("disconnected");
        };
      } catch (err) {
        console.error("Error creating WS connection:", err);
        if (active) setWsStatus("disconnected");
      }
    };

    connectWs();

    return () => {
      active = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [meetingId]);

  const onEndInterview = async () => {
    console.log("End initiated");
    if (wsRef.current) {
      wsRef.current.close();
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
            <div className={`h-2 w-2 rounded-full ${wsStatus === 'connected' ? 'bg-green-500 animate-pulse' : wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
            {wsStatus === 'connected' ? 'Online' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
          </Badge>
          <Badge variant="outline" className="gap-1.5 bg-background/50 backdrop-blur-md border-border text-muted-foreground">
            <Wifi className="h-3.5 w-3.5" />
            Stable
          </Badge>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 w-full p-6 flex items-center justify-center relative">

        {/* Conditional Layout */}
        {!isCaptionOn ? (
          /* Default State: Large Central Video Cards */
          <div className="grid grid-cols-2 gap-6 w-full max-w-6xl aspect-video max-h-[70vh]">
            <InterviewCard type="ai" isSpeaking={true} />
            <InterviewCard type="user" isSpeaking={isMicOn} />
          </div>
        ) : (
          /* Caption/Chat State: Split View */
          <div className="flex w-full max-w-7xl gap-6 h-[75vh]">

            {/* Left: Chat/Transcript Area */}
            <div className="flex-1 rounded-3xl border border-border bg-card p-6 flex flex-col relative overflow-hidden backdrop-blur-sm">

              {/* Mock Transcript */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-4 mask-image-b">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                      <span className="text-xs font-bold text-primary">AI</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">AI Interviewer</p>
                    <p className="text-muted-foreground leading-relaxed text-lg">Hello! Thanks for joining. To start, could you tell me about a challenging project you worked on recently?</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                    <span className="text-xs font-bold text-secondary-foreground">ME</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-secondary-foreground">You</p>
                    <p className="text-muted-foreground leading-relaxed text-lg">Sure. I recently led the migration of a legacy monolithic application to a microservices architecture. The main challenge was...</p>
                  </div>
                </div>

                {/* Live typing indicator */}
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
              </div>
            </div>

            {/* Right: Stacked Videos */}
            <div className="w-80 flex flex-col gap-4">
              <InterviewCard type="ai" isSpeaking={true} className="flex-1" />
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
