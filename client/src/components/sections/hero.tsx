import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ConsultationBooking } from '@/components/consultation/consultation-booking';
import { VideoModal } from '@/components/layout/video-modal';
import { Sparkles } from 'lucide-react';

export const HeroSection = memo(function HeroSection() {
  const { t } = useTranslation();

  return (
    <section id="home" className="gradient-hero overflow-hidden text-white pt-20 pb-20 lg:pt-28 lg:pb-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-orange-100 mb-6"><Sparkles className="h-4 w-4 text-orange-300" /> Better business, served thoughtfully</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <div>{t('hero.title').split(',')[0]}</div>
              <div className="mt-2">
                Foundation for <span className="text-accent-yellow">Legacy</span>
              </div>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-white">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <ConsultationBooking
                trigger={
                  <Button className="btn-accent px-8 py-4 font-semibold text-lg">
                    {t('hero.startJourney')}
                  </Button>
                }
              />
              <VideoModal
                videoUrl="https://www.youtube.com/watch?v=example"
                title={t('hero.watchDemo')}
                trigger={
                  <Button
                    className="border border-white/40 bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg text-white hover:bg-white/20"
                  >
                    {t('hero.watchDemo')}
                  </Button>
                }
              />
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-blue-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-yellow">
                  {t('hero.stats.clients')}
                </div>
                <div className="text-sm text-blue-200">
                  {t('hero.stats.clientsLabel')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-yellow">
                  {t('hero.stats.compliance')}
                </div>
                <div className="text-sm text-blue-200">
                  {t('hero.stats.complianceLabel')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-yellow">
                  {t('hero.stats.experience')}
                </div>
                <div className="text-sm text-blue-200">
                  {t('hero.stats.experienceLabel')}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 mt-10 lg:mt-2.5">
            <img
              src="/hero.JPG"
              alt="Professional business consulting team collaborating"
              width="800"
              height="533"
              className="rounded-2xl border-8 border-white/10 shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
});
