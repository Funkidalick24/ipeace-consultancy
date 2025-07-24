import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  response: string;
  confidence: number;
}

export async function getChatbotResponse(userMessage: string): Promise<ChatResponse> {
  try {
    const systemPrompt = `You are an AI assistant specialized in Zimbabwe's business law and regulations, particularly the Companies Act and Securities regulations. You work for IPEACE, a professional consulting firm.

Your role is to provide accurate, helpful information about:
- Zimbabwe Companies Act compliance
- Securities registration and licensing requirements
- Corporate governance frameworks
- Business incorporation procedures
- Regulatory compliance matters
- Professional licensing requirements

Provide clear, actionable advice while being professional and concise. If you're unsure about specific legal details, recommend consulting with IPEACE's human experts.

Respond in JSON format with 'response' and 'confidence' fields (confidence from 0-1).`;

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

    const result = JSON.parse(response.choices[0].message.content || '{"response": "I apologize, but I cannot process your request at this time.", "confidence": 0.1}');

    return {
      response: result.response || "I apologize, but I cannot process your request at this time.",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get AI response: " + (error as Error).message);
  }
}
