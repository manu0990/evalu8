"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export interface UseMicrophoneResult {
  /** The active MediaStream when recording, null otherwise */
  stream: MediaStream | null;
}

/**
 * Captures microphone audio and sends binary chunks over a WebSocket.
 *
 * Uses MediaRecorder with audio/webm (Opus codec) — Deepgram auto-detects
 * the container format so no encoding/sample_rate config is needed server-side.
 *
 * @param ws      - The open WebSocket connection (or null if not yet connected)
 * @param enabled - Whether to actively capture and send audio (maps to isMicOn)
 */
export function useMicrophone(
  ws: WebSocket | null,
  enabled: boolean
): UseMicrophoneResult {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  useEffect(() => {
    if (!ws || !enabled) {
      stopRecording();
      return;
    }

    let cancelled = false;
    const socket = ws;

    let audioContext: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let processor: ScriptProcessorNode | null = null;

    async function startRecording() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);

        // Force 16000 sample rate for Deepgram Flux
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });

        source = audioContext.createMediaStreamSource(mediaStream);
        
        // 4096 buffer size is approx 256ms at 16000Hz
        processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (!socket || socket.readyState !== WebSocket.OPEN) return;
          
          const float32Array = e.inputBuffer.getChannelData(0);
          const int16Array = new Int16Array(float32Array.length);
          
          for (let i = 0; i < float32Array.length; i++) {
            const val = float32Array[i] ?? 0;
            const s = Math.max(-1, Math.min(1, val));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          socket.send(int16Array.buffer);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      } catch (err) {
        console.error("[Mic] Failed to start recording:", err);
      }
    }

    startRecording();

    return () => {
      cancelled = true;
      if (processor) {
        processor.disconnect();
        processor.onaudioprocess = null;
      }
      if (source) {
        source.disconnect();
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
      stopRecording();
    };
  }, [ws, enabled, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRecording();
  }, [stopRecording]);

  return { stream };
}
