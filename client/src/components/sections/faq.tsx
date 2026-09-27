import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { ConsultationBooking } from '@/components/consultation/consultation-booking';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const FAQSection = memo(function FAQSection() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<number[]>([0]); // First FAQ open by default

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/faq');
        if (response.ok) {
          const data = await response.json();
          // Sort by order field
          const sortedFaqs = (data.faq || []).sort((a: FAQItem, b: FAQItem) => a.order - b.order);
          setFaqs(sortedFaqs);
        } else {
          console.error('Failed to fetch FAQs');
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };


  if (loading) {
    return (
      <section id="faq" className="py-20 bg-[var(--cream)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <HelpCircle className="text-2xl text-primary-blue h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('faq.subtitle')}
            </p>
          </div>
          <div className="text-center">Loading FAQs...</div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return (
      <section id="faq" className="py-20 bg-[var(--cream)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <HelpCircle className="text-2xl text-primary-blue h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {t('faq.subtitle')}
            </p>
  
            {/* Share Section */}
            <p className="text-gray-600 mb-6">{t('faq.empty.message')}</p>
            <ConsultationBooking
              trigger={<Button className="btn-primary px-8 py-3">{t('faq.empty.action')}</Button>}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-20 bg-[var(--cream)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="section-kicker mb-4">{t('faq.kicker')}</span>
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <HelpCircle className="text-2xl text-primary-blue h-8 w-8" />
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
              <Card key={faq.id} className="bg-white hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full h-auto min-h-16 p-6 text-left justify-between hover:bg-blue-50/50"
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
            <div className="bg-primary-blue rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-4">{t('faq.cta.question')}</h3>
              <p className="text-lg mb-6 opacity-90">
                {t('faq.cta.description')}
              </p>
              <ConsultationBooking
                trigger={
                  <Button className="btn-accent px-8 py-3">
                    {t('faq.cta.action')}
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
