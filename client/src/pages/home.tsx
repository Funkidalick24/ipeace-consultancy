import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero';
import { IPEACEValuesSection } from '@/components/sections/ipeace-values';
import { ServicesSection } from '@/components/sections/services';
import { TeamSection } from '@/components/sections/team';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { ContactSection } from '@/components/sections/contact';
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <IPEACEValuesSection />
        <ServicesSection />
        <TeamSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
