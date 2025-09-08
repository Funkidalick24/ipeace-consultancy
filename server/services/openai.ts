import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  response: string;
  confidence: number;
  followUpSuggestions?: string[];
}

export async function getChatbotResponse(userMessage: string): Promise<ChatResponse> {
  try {
    // Get enabled training files
    const trainingFiles = await storage.getTrainingFiles();
    const enabledTrainingFiles = trainingFiles.filter(file => file.trainingEnabled && file.extractedText);

    // Build training data context
    let trainingContext = '';
    if (enabledTrainingFiles.length > 0) {
      trainingContext = '\n\nADDITIONAL TRAINING DATA:\n';
      enabledTrainingFiles.forEach((file, index) => {
        trainingContext += `--- Training File ${index + 1}: ${file.originalName} ---\n`;
        // Limit each file's content to prevent token overflow (approximately 1000 characters per file)
        const truncatedText = file.extractedText!.length > 1000
          ? file.extractedText!.substring(0, 1000) + '...'
          : file.extractedText!;
        trainingContext += truncatedText + '\n\n';
      });
    }

    const systemPrompt = `You are an AI assistant specialized in Zimbabwe's business law and regulations, particularly the Companies Act and Securities regulations. You work for IPEACE, a professional consulting firm.

Your role is to provide accurate, helpful information about:
- Zimbabwe Companies Act compliance
- Securities registration and licensing requirements
- Corporate governance frameworks
- Business incorporation procedures
- Regulatory compliance matters
- Professional licensing requirements

${trainingContext}

Provide clear, actionable advice while being professional and concise. If you're unsure about specific legal details, recommend consulting with IPEACE's human experts.

After providing your response, also include 2-3 follow-up questions that the user might have based on your answer. These should help the user explore related topics or get more detailed information.

Respond in JSON format with 'response', 'confidence', and 'followUpSuggestions' fields (confidence from 0-1).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"response": "I apologize, but I cannot process your request at this time.", "confidence": 0.1, "followUpSuggestions": []}');

    return {
      response: result.response || "I apologize, but I cannot process your request at this time.",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      followUpSuggestions: result.followUpSuggestions || [],
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get AI response: " + (error as Error).message);
  }
}
