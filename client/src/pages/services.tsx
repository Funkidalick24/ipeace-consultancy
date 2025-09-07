import { lazy, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ServicesSection } from '@/components/sections/services';

// Lazy load chatbot widget
const ChatbotWidget = lazy(() => import('@/components/chatbot/chatbot-widget').then(module => ({ default: module.ChatbotWidget })));

export default function Services() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <ServicesSection />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  );
}