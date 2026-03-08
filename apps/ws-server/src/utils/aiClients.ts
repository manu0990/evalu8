import { GoogleGenAI } from "@google/genai";
import { config } from "../ws-env.config";


export const gemini = new GoogleGenAI({ apiKey: config.geminiApiKey });
