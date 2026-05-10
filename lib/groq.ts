import OpenAI from "openai";

// Initialize OpenAI client pointing to Groq
// We use the OpenAI SDK since Groq provides an OpenAI-compatible endpoint
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy-key-for-build",
  baseURL: "https://api.groq.com/openai/v1",
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";
