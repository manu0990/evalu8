import { DeepgramClient } from "@deepgram/sdk";
import { config } from "../ws-env.config";

// ── Types ──
export interface TranscriptResult {
  transcript: string;
  isFinal: boolean;
  speechFinal: boolean;
}

export type OnTranscriptCallback = (result: TranscriptResult) => void;

export interface STTServiceOptions {
  onTranscript: OnTranscriptCallback;
  endpointing?: number;  // Endpointing silence threshold in ms (default: 500)
}

// Shape of a Deepgram ListenV1 Results message
interface DeepgramResultsMessage {
  type: "Results";
  is_final?: boolean;
  speech_final?: boolean;
  channel?: {
    alternatives?: Array<{
      transcript?: string;
      confidence?: number;
    }>;
  };
}

// ── Deepgram client (singleton) ──
const deepgramClient = new DeepgramClient({ apiKey: config.deepgramApiKey });

// ── Service ──
export class STTService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dgSocket: any = null;
  private onTranscript: OnTranscriptCallback;
  private endpointing: number;

  constructor(options: STTServiceOptions) {
    this.onTranscript = options.onTranscript;
    this.endpointing = options.endpointing ?? 2000;
  }

  async init(): Promise<void> {
    this.dgSocket = await deepgramClient.listen.v1.connect({
      model: config.deepgramSttModelName,
      encoding: "linear16",
      sample_rate: 16000,
      smart_format: "true",
      interim_results: "true",
      endpointing: this.endpointing,
      utterance_end_ms: this.endpointing.toString(), // Guaranteed turn end if VAD is confused by noise
      Authorization: `Token ${config.deepgramApiKey}`,
    });

    this.dgSocket.connect();

    this.dgSocket.on("open", () => console.log("[STT] Deepgram connection opened"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.dgSocket.on("message", (message: any) => {
      const type = message.type || "";
      if (type !== "Results" && type !== "UtteranceEnd") {
        return;
      }

      let transcript = "";
      let isFinal = false;
      let speechFinal = false;

      if (type === "UtteranceEnd") {
        transcript = "";
        isFinal = false;
        speechFinal = true;
      } else {
        const results = message as DeepgramResultsMessage;
        transcript = results.channel?.alternatives?.[0]?.transcript ?? "";
        isFinal = results.is_final ?? false;
        speechFinal = results.speech_final ?? false;
      }

      if (!transcript && !speechFinal) return;


      this.onTranscript({
        transcript,
        isFinal,
        speechFinal,
      });
    });

    this.dgSocket.on("error", (err: Error) => {
      console.error("[STT] Deepgram error:", err);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.dgSocket.on("close", (event: any) => {
      console.log(`[STT] Deepgram connection closed. Code: ${event?.code}, Reason: ${event?.reason}`);
    });

    // Wait for the connection to be ready
    await this.dgSocket.waitForOpen();
  }

  // Forward a binary audio chunk from the client to Deepgram
  sendAudio(audioData: Buffer): void {
    if (this.dgSocket && this.dgSocket.readyState === 1) {
      this.dgSocket.sendMedia(audioData);
    }
  }

  // Gracefully close the Deepgram connection
  async close(): Promise<void> {
    if (this.dgSocket) {
      try {
        this.dgSocket.sendCloseStream({ type: "CloseStream" });
      } catch {
        // Connection may already be closed
      }
      this.dgSocket.close();
      this.dgSocket = null;
    }
  }
}
