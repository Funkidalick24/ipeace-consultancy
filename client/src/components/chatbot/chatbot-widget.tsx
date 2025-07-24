import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { nanoid } from 'nanoid';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  response: string;
  confidence: number;
  sessionId: string;
}

export function ChatbotWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => nanoid());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens for the first time
      setMessages([{
        id: nanoid(),
        content: t('chatbot.welcome'),
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, t, messages.length]);

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: nanoid(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      }]);
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => [...prev, {
        id: nanoid(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team.",
        isUser: false,
        timestamp: new Date(),
      }]);
    },
  });

  const sendMessage = () => {
    const message = input.trim();
    if (!message) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: nanoid(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    }]);

    setInput('');
    chatMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary-blue text-white w-16 h-16 rounded-full shadow-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-110"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 h-96 shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <CardHeader className="bg-gradient-to-r from-primary-blue to-secondary-blue text-white p-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center">
                <Bot className="text-primary-blue h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold">{t('chatbot.title')}</h4>
                <p className="text-xs text-blue-200">{t('chatbot.subtitle')}</p>
              </div>
            </div>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        message.isUser
                          ? 'bg-primary-blue text-white'
                          : 'bg-white shadow-sm border border-gray-100'
                      }`}
                    >
                      {!message.isUser && (
                        <Bot className="text-primary-blue mr-2 h-4 w-4 inline" />
                      )}
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-sm border border-gray-100 p-3 rounded-lg max-w-xs">
                      <Bot className="text-primary-blue mr-2 h-4 w-4 inline" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chatbot.placeholder')}
                className="flex-1 text-sm"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || chatMutation.isPending}
                className="bg-primary-blue hover:bg-blue-800"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('chatbot.powered')}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
