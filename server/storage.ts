import { users, contactSubmissions, chatMessages, type User, type InsertUser, type InsertContact, type ContactSubmission, type ChatMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  createChatMessage(sessionId: string, userMessage: string, aiResponse: string): Promise<ChatMessage>;
  getChatHistory(sessionId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, ContactSubmission>;
  private chats: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentContactId: number;
  private currentChatId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.chats = new Map();
    this.currentUserId = 1;
    this.currentContactId = 1;
    this.currentChatId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactSubmission(contact: InsertContact): Promise<ContactSubmission> {
    const id = this.currentContactId++;
    const submission: ContactSubmission = {
      ...contact,
      id,
      company: contact.company || null,
      service: contact.service || null,
      newsletter: contact.newsletter || null,
      createdAt: new Date(),
    };
    this.contacts.set(id, submission);
    return submission;
  }

  async createChatMessage(sessionId: string, userMessage: string, aiResponse: string): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = {
      id,
      sessionId,
      userMessage,
      aiResponse,
      createdAt: new Date(),
    };
    this.chats.set(id, message);
    return message;
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chats.values())
      .filter(chat => chat.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
