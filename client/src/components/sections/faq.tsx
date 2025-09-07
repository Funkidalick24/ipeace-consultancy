import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { ConsultationBooking } from '@/components/consultation/consultation-booking';

export const FAQSection = memo(function FAQSection() {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([0]); // First FAQ open by default

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = t('faq.questions', { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-primary-blue rounded-lg flex items-center justify-center mb-6 mx-auto">
            <HelpCircle className="text-2xl text-accent-yellow h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full p-6 text-left justify-between hover:bg-gray-50"
                    onClick={() => toggleItem(index)}
                    aria-expanded={openItems.includes(index)}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {openItems.includes(index) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </Button>

                  {openItems.includes(index) && (
                    <div
                      id={`faq-answer-${index}`}
                      className="px-6 pb-6 text-gray-700 leading-relaxed"
                    >
                      {faq.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-primary-blue to-secondary-blue rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Still have questions about Zimbabwe business compliance?</h3>
              <p className="text-lg mb-6 opacity-90">
                Our AI-powered consultants can answer any question about company registration, compliance requirements, or business licensing in Zimbabwe.
              </p>
              <ConsultationBooking
                trigger={
                  <Button className="btn-accent px-8 py-3">
                    Ask Our AI Assistant
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});