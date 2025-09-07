import { lazy, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { IPEACEValuesSection } from '@/components/sections/ipeace-values';
import { TeamSection } from '@/components/sections/team';

// Lazy load chatbot widget
const ChatbotWidget = lazy(() => import('@/components/chatbot/chatbot-widget').then(module => ({ default: module.ChatbotWidget })));

export default function About() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <IPEACEValuesSection />
        <TeamSection />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  );
}