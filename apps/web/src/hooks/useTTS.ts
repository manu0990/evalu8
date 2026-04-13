"use client";

import { useState, useRef, useCallback } from "react";
import Cartesia from "@cartesia/cartesia-js";
import axios from "axios";

const SAMPLE_RATE = 44100;
type TTSWebSocket = Awaited<ReturnType<Cartesia["tts"]["websocket"]>>;
type WindowWithWebKitAudioContext = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const wsRef = useRef<TTSWebSocket | null>(null);

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

  const connect = useCallback(async () => {
    if (wsRef.current) return wsRef.current;

    try {
      const { data: { token } } = await axios.post("/api/token");

      const client = new Cartesia({ token });
      const ws = await client.tts.websocket();
      wsRef.current = ws;
      return ws;
    } catch (err) {
      console.error("Cartesia WebSocket connection error:", err);
      throw err;
    }
  }, []);

  const playChunk = useCallback(async (text: string) => {
    if (!text.trim()) return;
    initAudioCtx();

    try {
      const ws = await connect();
      const audioCtx = audioCtxRef.current!;

      setIsPlaying(true);

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      if (nextStartTimeRef.current < audioCtx.currentTime) {
        nextStartTimeRef.current = audioCtx.currentTime;
      }

      const resp = ws.generate({
        model_id: "sonic-3-2026-01-12",
        transcript: text,
        voice: { mode: "id", id: "5ee9feff-1265-424a-9d7f-8e4d431a12c7" },
        output_format: { container: "raw", encoding: "pcm_f32le", sample_rate: SAMPLE_RATE },
      });

      for await (const event of resp) {
        if (event.type === "chunk" && event.audio) {
          const aligned = new ArrayBuffer(event.audio.byteLength);
          new Uint8Array(aligned).set(event.audio);
          const floats = new Float32Array(aligned);

          const buf = audioCtx.createBuffer(1, floats.length, SAMPLE_RATE);
          buf.getChannelData(0).set(floats);

          const source = audioCtx.createBufferSource();
          source.buffer = buf;
          source.connect(audioCtx.destination);

          const startTime = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
          source.start(startTime);
          nextStartTimeRef.current = startTime + buf.duration;
        }
      }

      // Clear isPlaying after the audio chunks are finished playing
      setTimeout(() => {
        if (audioCtx.currentTime >= nextStartTimeRef.current - 0.1) {
          setIsPlaying(false);
        }
      }, Math.max(0, nextStartTimeRef.current - audioCtx.currentTime) * 1000);

    } catch (err) {
      console.error("Error generating/playing chunk:", err);
      setIsPlaying(false);
    }
  }, [connect, initAudioCtx]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore close failures during cleanup.
      }
      wsRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { playChunk, disconnect, isPlaying };
}
