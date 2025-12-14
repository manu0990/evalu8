import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3Client";

export async function getResumeBufferFromS3(s3Key: string): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      throw new Error("No body in S3 response");
    }

    // convert the stream to Buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Error fetching resume from S3:", error);
    throw new Error(`Failed to fetch resume from S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}
