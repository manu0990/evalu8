import Cartesia from "@cartesia/cartesia-js";
import { WebSocket } from "ws";
import { config } from "../ws-env.config";

const cartesiaClient = new Cartesia({
  apiKey: config.cartesiaApiKey,
});

type TTSWebSocket = Awaited<ReturnType<typeof cartesiaClient.tts.websocket>>;
type TTSContext = ReturnType<TTSWebSocket["context"]>;

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

export class TTSService {
  private ws?: TTSWebSocket;
  private ctx?: TTSContext;
  private socket: WebSocket;
  private sendQueue: Promise<void> = Promise.resolve();

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  async init() {
    this.ws = await cartesiaClient.tts.websocket();

    this.ws.on("error", (err) => {
      const msg = getErrorMessage(err);
      if (!msg.includes("No valid transcripts passed")) {
        console.error("Cartesia WS error:", msg);
      }
    });
  }

  /** Create a fresh context + receive loop for a new AI response */
  async beginResponse() {
    if (!this.ws) {
      throw new Error("TTS websocket has not been initialized");
    }

    this.sendQueue = Promise.resolve();
    this.ctx = this.ws.context({
      model_id: "sonic-3",
      voice: {
        mode: "id",
        id: config.cartesiaVoiceModel,
      },
      output_format: {
        container: "raw",
        encoding: "pcm_f32le",
        sample_rate: 44100,
      },
    });

    // Start forwarding audio chunks to the cartesiaClient in the background
    this.receiveAudio(this.ctx);
  }

  private receivePromise: Promise<void> = Promise.resolve();

  private async receiveAudio(ctx: TTSContext) {
    this.receivePromise = (async () => {
      try {
        for await (const event of ctx.receive()) {
          if (event.type === "chunk" && event.audio) {
            if (this.socket.readyState === WebSocket.OPEN) {
              this.socket.send(event.audio, { binary: true });
            }
          }
        }
      } catch (err) {
        // Context was closed — expected when endResponse() is called
        const msg = getErrorMessage(err);
        if (!msg.includes("closed") && !msg.includes("No valid transcripts passed")) {
          console.error("TTS receive error:", err);
        }
      }
    })();
  }

  async pushText(text: string) {
    const transcript = text.trim();
    const ctx = this.ctx;
    if (!ctx || !transcript) return;

    this.sendQueue = this.sendQueue
      .then(async () => {
        if (this.ctx !== ctx) return;

        await ctx.push({
          transcript,
        });
      })
      .catch((err) => {
        console.error("TTS push error:", err);
      });
  }

  /** Signal end of the current response — closes the context's receive stream */
  async endResponse() {
    if (this.ctx) {
      await this.sendQueue;

      // Signal Cartesia that we are done sending text
      try {
        await this.ctx.no_more_inputs();
      } catch {
        // Ignored
      }

      // Wait for Cartesia to finish streaming all audio chunks for this context
      await this.receivePromise;

      this.ctx = undefined;
    }
  }

  async close() {
    await this.endResponse();
    this.ws?.close();
  }
}
