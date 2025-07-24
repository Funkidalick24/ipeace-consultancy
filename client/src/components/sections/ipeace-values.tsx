import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Target, Users, Rocket, Shield, Trophy } from 'lucide-react';

const valueIcons = {
  innovation: Lightbulb,
  precision: Target,
  empowerment: Users,
  agility: Rocket,
  compliance: Shield,
  excellence: Trophy,
};

export function IPEACEValuesSection() {
  const { t } = useTranslation();

  const values = [
    'innovation',
    'precision', 
    'empowerment',
    'agility',
    'compliance',
    'excellence'
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('about.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value) => {
            const Icon = valueIcons[value as keyof typeof valueIcons];
            return (
              <Card key={value} className="bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary-blue rounded-lg flex items-center justify-center mb-6">
                    <Icon className="text-2xl text-accent-yellow h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {t(`about.values.${value}.title`)}
                  </h3>
                  <p className="text-gray-600">
                    {t(`about.values.${value}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
