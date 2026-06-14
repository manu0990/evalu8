"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@repo/ui/lib/utils";

interface VoiceVisualizerProps {
  isSpeaking: boolean;
  stream?: MediaStream | null;
  barCount?: number;
  className?: string;
}

export function VoiceVisualizer({
  isSpeaking,
  stream,
  barCount = 4,
  className,
}: VoiceVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(0.1));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSpeaking) {
      setHeights(Array(barCount).fill(0.1));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let lastUpdate = Date.now();
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let dataArray: Uint8Array | null = null;

    if (stream) {
      audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    
    function animate() {
      const now = Date.now();
      
      if (stream && analyser && dataArray) {
        // Real volume from mic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        analyser.getByteFrequencyData(dataArray as any);
        const center = barCount / 2;
        const binCount = dataArray.length;
        
        const newHeights = [];
        for (let i = 0; i < barCount; i++) {
          const distFromCenter = Math.abs(i - center) / center;
          const binIndex = Math.floor(distFromCenter * (binCount - 1));
          const value = dataArray[binIndex] ?? 0;
          const normalized = value / 255;
          newHeights.push(0.1 + normalized * 0.9);
        }
        setHeights(newHeights);
      } else {
        // Simulated volume for AI
        if (now - lastUpdate > 70) {
          setHeights(prev => 
            prev.map(() => 0.2 + Math.random() * 0.8)
          );
          lastUpdate = now;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (source) source.disconnect();
      if (audioCtx) audioCtx.close().catch(() => undefined);
    };
  }, [isSpeaking, stream, barCount]);

  return (
    <div
      className={cn(
        "flex items-end justify-center gap-1 h-4",
        className
      )}
    >
      {heights.map((scale, i) => (
        <div
          key={i}
          className="h-full w-1 rounded-full bg-primary transition-all duration-75 origin-center"
          style={{
            transform: `scaleY(${scale})`
          }}
        />
      ))}
    </div>
  );
}
