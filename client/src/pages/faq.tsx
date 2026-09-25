import { lazy, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FAQSection } from '@/components/sections/faq';
import { SEOHead, pageSEO } from '@/components/seo/SEOHead';

// Lazy load chatbot widget
const ChatbotWidget = lazy(() => import('@/components/chatbot/chatbot-widget').then(module => ({ default: module.ChatbotWidget })));

export default function FAQ() {
  return (
    <div className="site-page min-h-screen">
      <SEOHead {...pageSEO.faq} />
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
