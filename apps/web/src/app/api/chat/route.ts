import { getGeminiModel } from "@/lib/geminiClient";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return new Response("Missing message", { status: 400 });
    }

    const result = await getGeminiModel().generateContentStream(message);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            controller.enqueue(new TextEncoder().encode(chunk.text()));
          }
        } catch (e) {
          console.error(e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(message, { status: 500 });
  }
}
