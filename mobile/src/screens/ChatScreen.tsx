import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';

import { colors } from '../theme';
import { apiRequest } from '../services/api';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  followUpSuggestions?: string[];
}

export default function ChatScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: '1',
      content: t('chat.welcome'),
      isUser: false,
      timestamp: new Date(),
      followUpSuggestions: t('chat.suggestions', { returnObjects: true }) as string[],
    }]);
  }, [t]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        followUpSuggestions: data.followUpSuggestions,
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }]);
    },
  });

  const sendMessage = (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: trimmedMessage,
      isUser: true,
      timestamp: new Date(),
    }]);

    setInput('');
    chatMutation.mutate(trimmedMessage);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View key={message.id} style={styles.messageWrapper}>
            <Card style={[
              styles.messageCard,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}>
              <Card.Content style={styles.messageContent}>
                {!message.isUser && (
                  <Text style={styles.aiLabel}>🤖 AI Assistant</Text>
                )}
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.content}
                </Text>
                
                {/* Follow-up suggestions */}
                {!message.isUser && message.followUpSuggestions && message.followUpSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsLabel}>Related questions:</Text>
                    <View style={styles.suggestions}>
                      {message.followUpSuggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          style={styles.suggestionChip}
                          onPress={() => handleSuggestedQuestion(suggestion)}
                        >
                          {suggestion}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>
        ))}
        
        {chatMutation.isPending && (
          <View style={styles.messageWrapper}>
            <Card style={[styles.messageCard, styles.aiMessage]}>
              <Card.Content style={styles.messageContent}>
                <Text style={styles.aiLabel}>🤖 AI Assistant</Text>
                <Text style={styles.aiMessageText}>Thinking...</Text>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={t('chat.placeholder')}
          multiline
          disabled={chatMutation.isPending}
        />
        <Button
          mode="contained"
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || chatMutation.isPending}
          style={styles.sendButton}
        >
          {t('chat.send')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageCard: {
    elevation: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryBlue,
    maxWidth: '80%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    maxWidth: '90%',
  },
  messageContent: {
    padding: 12,
  },
  aiLabel: {
    fontSize: 12,
    color: colors.primaryBlue,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.white,
  },
  aiMessageText: {
    color: colors.gray900,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primaryBlue,
  },
});