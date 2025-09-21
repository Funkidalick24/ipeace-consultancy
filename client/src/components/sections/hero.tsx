import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ConsultationBooking } from '@/components/consultation/consultation-booking';
import { VideoModal } from '@/components/layout/video-modal';

export const HeroSection = memo(function HeroSection() {
  const { t } = useTranslation();

  return (
    <section id="home" className="gradient-hero text-white pt-18 pb-20 lg:pt-26 lg:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <div>{t('hero.title').split('.')[0]}.</div>
              <div className="mt-2">
                Foundation for <span className="text-accent-yellow">Legacy</span>.
              </div>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-white">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <ConsultationBooking
                trigger={
                  <Button className="btn-accent px-8 py-4 rounded-lg font-semibold text-lg">
                    {t('hero.startJourney')}
                  </Button>
                }
              />
              <VideoModal
                videoUrl="https://www.youtube.com/watch?v=example"
                title={t('hero.watchDemo')}
                trigger={
                  <Button
                    className="btn-accent px-8 py-4 rounded-lg font-semibold text-lg"
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
              className="rounded-xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
});
