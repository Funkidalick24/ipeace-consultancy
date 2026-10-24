import { Router } from 'express';
import { storage } from '../storage';
import { getChatbotResponse } from '../services/openai';
import { chatRequestSchema } from '@shared/schema';
import sanitizeHtml from 'sanitize-html';
import { nanoid } from 'nanoid';

export const chatRoutes = Router();

chatRoutes.post('/', async (req, res) => {
  try {
    const { message, sessionId } = chatRequestSchema.parse(req.body);
    const currentSessionId = sessionId || nanoid();

    const sanitizedMessage = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

    const aiResponse = await getChatbotResponse(sanitizedMessage);

    await storage.createChatMessage(currentSessionId, sanitizedMessage, aiResponse.response);

    res.json({
      response: aiResponse.response,
      confidence: aiResponse.confidence,
      followUpSuggestions: aiResponse.followUpSuggestions,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to process chat message",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

chatRoutes.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await storage.getChatHistory(sessionId);
    res.json({ history });
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: "Failed to get chat history" });
  }
});
