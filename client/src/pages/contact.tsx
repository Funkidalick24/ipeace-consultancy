import { lazy, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContactSection } from '@/components/sections/contact';
import { SEOHead, pageSEO } from '@/components/seo/SEOHead';

// Lazy load chatbot widget
const ChatbotWidget = lazy(() => import('@/components/chatbot/chatbot-widget').then(module => ({ default: module.ChatbotWidget })));

export default function Contact() {
  return (
    <div className="min-h-screen">
      <SEOHead {...pageSEO.contact} />
      <Header />
      <main className="pt-16">
        <ContactSection />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  );
}