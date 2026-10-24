import { Router } from 'express';
import { storage } from '../storage';
import sanitizeHtml from 'sanitize-html';
import mongoose from 'mongoose';
import { authenticateClient } from '../middleware/auth';

export const clientRoutes = Router();

clientRoutes.get('/profile', authenticateClient, async (req: any, res) => {
  try {
    const profile = await storage.getClientProfile(req.user._id.toString());
    const user = await storage.getUser(req.user._id.toString());

    res.json({
      success: true,
      profile: profile || null,
      user: user ? {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        company: user.company,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin
      } : null
    });
  } catch (error) {
    console.error("Get client profile error:", error);
    res.status(500).json({ error: "Failed to get client profile" });
  }
});

clientRoutes.put('/profile', authenticateClient, async (req: any, res) => {
  try {
    const { profileData, userData } = req.body;

    if (userData) {
      await storage.updateUserRole(req.user._id.toString(), req.user.role);
    }

    const profile = await storage.updateClientProfile(req.user._id.toString(), profileData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error("Update client profile error:", error);
    res.status(500).json({ error: "Failed to update client profile" });
  }
});

clientRoutes.get('/dashboard', authenticateClient, async (req: any, res) => {
  try {
    const clientId = req.user._id.toString();

    const [consultations, conversations, invoices, unreadCount] = await Promise.all([
      storage.getConsultationsForClient(clientId),
      storage.getConversationsForUser(clientId),
      storage.getInvoicesForClient(clientId),
      storage.getUnreadConversationCount(clientId)
    ]);

    const recentConsultations = consultations.slice(0, 3);

    const recentConversations = conversations
      .filter(conv => conv.lastMessage)
      .sort((a, b) => new Date(b.lastMessage!.createdAt).getTime() - new Date(a.lastMessage!.createdAt).getTime())
      .slice(0, 3);

    const recentMessages = await Promise.all(
      recentConversations.map(async (conv) => {
        const messages = await storage.getMessagesForConversation(conv._id.toString());
        const lastMessage = messages[messages.length - 1];
        return {
          _id: lastMessage?._id || conv._id,
          subject: conv.subject,
          content: conv.lastMessage!.content,
          createdAt: conv.lastMessage!.createdAt,
          conversationId: conv._id
        };
      })
    );

    const recentInvoices = invoices.slice(0, 3);

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalConsultations: consultations.length,
          totalMessages: conversations.length,
          totalInvoices: invoices.length,
          unreadMessages: unreadCount
        },
        recentActivity: {
          consultations: recentConsultations,
          messages: recentMessages,
          invoices: recentInvoices
        }
      }
    });
  } catch (error) {
    console.error("Get client dashboard error:", error);
    res.status(500).json({ error: "Failed to get dashboard data" });
  }
});

clientRoutes.get('/consultations', authenticateClient, async (req: any, res) => {
  try {
    const consultations = await storage.getConsultationsForClient(req.user._id.toString());
    res.json({ consultations });
  } catch (error) {
    console.error("Get client consultations error:", error);
    res.status(500).json({ error: "Failed to get consultations" });
  }
});

clientRoutes.get('/messages', authenticateClient, async (req: any, res) => {
  try {
    const messages = await storage.getMessagesForUser(req.user._id.toString());
    const unreadCount = await storage.getUnreadMessageCount(req.user._id.toString());
    res.json({ messages, unreadCount });
  } catch (error) {
    console.error("Get client messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

clientRoutes.post('/messages', authenticateClient, async (req: any, res) => {
  try {
    const { subject, content, messageType } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const adminUsers = await storage.getAllUsers();
    const adminUser = adminUsers.find(user => user.role === 'admin');

    if (!adminUser) {
      return res.status(500).json({ error: "No admin user found" });
    }

    const existingConversations = await storage.getConversationsForUser(req.user._id.toString());
    let conversation = existingConversations.find(conv =>
      conv.participants.length === 2 &&
      conv.participants.some(p => p._id.toString() === adminUser._id.toString()) &&
      conv.participants.some(p => p._id.toString() === req.user._id.toString())
    );

    if (!conversation) {
      conversation = await storage.createConversation({
        participants: [req.user._id, adminUser._id],
        subject: subject || 'Support Conversation',
        conversationType: 'support'
      });
    }

    const message = await storage.addMessageToConversation(conversation._id.toString(), {
      fromUserId: req.user._id,
      toUserId: new mongoose.Types.ObjectId(adminUser._id),
      content: sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }),
      messageType: messageType || 'general'
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: message._id,
      conversationId: conversation._id.toString()
    });
  } catch (error) {
    console.error("Send client message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

clientRoutes.patch('/messages/:id/read', authenticateClient, async (req: any, res) => {
  try {
    const message = await storage.markMessageAsRead(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error("Mark message read error:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

clientRoutes.get('/conversations', authenticateClient, async (req: any, res) => {
  try {
    const conversations = await storage.getConversationsForUser(req.user._id.toString());
    const unreadCount = await storage.getUnreadConversationCount(req.user._id.toString());
    res.json({ conversations, unreadCount });
  } catch (error) {
    console.error("Get client conversations error:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

clientRoutes.get('/conversations/:id', authenticateClient, async (req: any, res) => {
  try {
    const conversation = await storage.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await storage.getMessagesForConversation(req.params.id);
    res.json({ conversation, messages });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

clientRoutes.post('/conversations', authenticateClient, async (req: any, res) => {
  try {
    const { toUserId, subject, content, messageType } = req.body;

    if (!toUserId || !content) {
      return res.status(400).json({ error: "Recipient and content are required" });
    }

    const existingConversations = await storage.getConversationsForUser(req.user._id.toString());
    let conversation = existingConversations.find(conv =>
      conv.participants.length === 2 &&
      conv.participants.some(p => p._id.toString() === toUserId) &&
      conv.participants.some(p => p._id.toString() === req.user._id.toString())
    );

    if (!conversation) {
      conversation = await storage.createConversation({
        participants: [req.user._id, toUserId],
        subject: subject || 'New Conversation',
        conversationType: 'direct'
      });
    }

    const message = await storage.addMessageToConversation(conversation._id.toString(), {
      fromUserId: req.user._id,
      toUserId: toUserId,
      content: sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }),
      messageType: messageType || 'general'
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      conversationId: conversation._id.toString(),
      messageId: message._id
    });
  } catch (error) {
    console.error("Send conversation message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

clientRoutes.post('/conversations/:id/messages', authenticateClient, async (req: any, res) => {
  try {
    const { content, messageType } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const conversation = await storage.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: "Access denied" });
    }

    const recipientId = conversation.participants.find(p => p._id.toString() !== req.user._id.toString());
    if (!recipientId) {
      return res.status(400).json({ error: "No recipient found" });
    }

    const message = await storage.addMessageToConversation(req.params.id, {
      fromUserId: req.user._id,
      toUserId: recipientId,
      content: sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }),
      messageType: messageType || 'general'
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: message._id
    });
  } catch (error) {
    console.error("Send conversation message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

clientRoutes.patch('/conversations/:id/read', authenticateClient, async (req: any, res) => {
  try {
    const conversation = await storage.markConversationAsRead(req.params.id, req.user._id.toString());
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    console.error("Mark conversation read error:", error);
    res.status(500).json({ error: "Failed to mark conversation as read" });
  }
});

clientRoutes.get('/invoices', authenticateClient, async (req: any, res) => {
  try {
    const invoices = await storage.getInvoicesForClient(req.user._id.toString());
    res.json({ invoices });
  } catch (error) {
    console.error("Get client invoices error:", error);
    res.status(500).json({ error: "Failed to get invoices" });
  }
});

clientRoutes.get('/documents', authenticateClient, async (req: any, res) => {
  try {
    const documents = await storage.getClientDocuments(req.user._id.toString());
    res.json({ documents });
  } catch (error) {
    console.error("Get client documents error:", error);
    res.status(500).json({ error: "Failed to get documents" });
  }
});

clientRoutes.get('/resources', authenticateClient, async (req: any, res) => {
  try {
    const { search, category } = req.query;
    let resources;

    if (search || category) {
      resources = await storage.searchResources(search as string, category as string);
    } else {
      resources = await storage.getResourcesForClients();
    }

    res.json({ resources });
  } catch (error) {
    console.error("Get client resources error:", error);
    res.status(500).json({ error: "Failed to get resources" });
  }
});

clientRoutes.post('/resources/:id/download', authenticateClient, async (req: any, res) => {
  try {
    const resource = await storage.incrementResourceDownloadCount(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json({ success: true, message: 'Download recorded' });
  } catch (error) {
    console.error("Record resource download error:", error);
    res.status(500).json({ error: "Failed to record download" });
  }
});
