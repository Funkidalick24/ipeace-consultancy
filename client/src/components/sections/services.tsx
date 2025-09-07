import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConsultationBooking } from '@/components/consultation/consultation-booking';
import {
  Gavel,
  Bot,
  TrendingUp,
  GraduationCap,
  FileText,
  Headphones,
  Check,
  ArrowRight
} from 'lucide-react';

const serviceIcons = {
  regulatory: Gavel,
  ai: Bot,
  strategy: TrendingUp,
  training: GraduationCap,
  documents: FileText,
  support: Headphones,
};

const serviceFeatures = {
  regulatory: [
    'Companies Act compliance audits',
    'Securities registration guidance',
    'Corporate governance frameworks'
  ],
  ai: [
    '24/7 AI consultation chatbot',
    'Document analysis and review',
    'Risk assessment algorithms'
  ],
  strategy: [
    'Market analysis and planning',
    'Digital transformation roadmaps',
    'Performance optimization'
  ],
  training: [
    'Compliance workshops',
    'Leadership development',
    'Digital skills training'
  ],
  documents: [
    'Company incorporation',
    'Annual returns filing',
    'Contract review and drafting'
  ],
  support: [
    'Instant AI responses',
    'Expert escalation',
    'Emergency consultation'
  ]
};

const serviceDescriptions = {
  regulatory: 'Navigate Zimbabwe\'s Companies Act, Securities regulations, and other statutory requirements with confidence and precision.',
  ai: 'Leverage artificial intelligence trained on Zimbabwe\'s legal frameworks for instant, accurate business guidance.',
  strategy: 'Strategic planning and implementation services designed to accelerate growth while maintaining regulatory compliance.',
  training: 'Comprehensive training programs to upskill your team on regulatory requirements and best business practices.',
  documents: 'Professional document preparation, review, and filing services for all business registration and compliance needs.',
  support: 'Round-the-clock support through our AI chatbot and expert consultants for urgent business and compliance queries.'
};

export const ServicesSection = memo(function ServicesSection() {
  const { t } = useTranslation();

  const services = ['regulatory', 'ai', 'strategy', 'training', 'documents', 'support'];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = serviceIcons[service as keyof typeof serviceIcons];
            const features = serviceFeatures[service as keyof typeof serviceFeatures];
            const description = serviceDescriptions[service as keyof typeof serviceDescriptions];
            
            return (
              <Card key={service} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-blue to-secondary-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-2xl text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                    {t(`contact.form.services.${service}`)}
                  </h3>
                  <p className="text-gray-700 mb-6">
                    {description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <Check className="text-green-500 mr-2 h-4 w-4" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="ghost"
                    className="text-primary-blue font-semibold hover:text-secondary-blue transition-colors duration-200 p-0"
                    onClick={() => {
                      window.location.href = '/contact';
                    }}
                    aria-label={`${t('services.learnMore')} about ${t(`contact.form.services.${service}`)}`}
                  >
                    {t('services.learnMore')} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-blue to-secondary-blue rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">{t('services.cta.title')}</h3>
            <p className="text-xl mb-8 text-black">{t('services.cta.subtitle')}</p>
            <ConsultationBooking
              trigger={
                <Button className="btn-accent px-8 py-4 rounded-lg font-semibold text-lg">
                  {t('services.cta.button')}
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
});
