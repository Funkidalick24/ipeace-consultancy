import { lazy, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { SEOHead, pageSEO } from '@/components/seo/SEOHead';

// Lazy load components that are not immediately needed
const ChatbotWidget = lazy(() => import('@/components/chatbot/chatbot-widget').then(module => ({ default: module.ChatbotWidget })));

export default function Home() {
  return (
    <div className="site-page min-h-screen">
      <SEOHead {...pageSEO.home} />
      <Header />
      <main className="pt-16">
        <HeroSection />
        <TestimonialsSection />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  );
}
