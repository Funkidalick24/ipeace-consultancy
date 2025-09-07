import { lazy, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FAQSection } from '@/components/sections/faq';

// Lazy load chatbot widget
const ChatbotWidget = lazy(() => import('@/components/chatbot/chatbot-widget').then(module => ({ default: module.ChatbotWidget })));

export default function FAQ() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <FAQSection />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  );
}