import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle, Share2, Copy, Facebook, Twitter, Linkedin } from 'lucide-react';
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
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = 'FAQ - Business Consulting Questions Answered | IPEACE';
  const shareText = 'Check out these frequently asked questions about business consulting and compliance in Zimbabwe.';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  if (loading) {
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
          <div className="text-center">Loading FAQs...</div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
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
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {t('faq.subtitle')}
            </p>
  
            {/* Share Section */}
            <div className="flex flex-col items-center space-y-4">
              <Button
                variant="outline"
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share FAQ
              </Button>
  
              {showShareOptions && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shareOnFacebook}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shareOnTwitter}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-500"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shareOnLinkedIn}
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="text-center text-gray-600">
            No FAQs available at the moment.
          </div>
        </div>
      </section>
    );
  }

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
              <Card key={faq.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
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
                Our consultants can answer any question about company registration, compliance requirements, or business licensing in Zimbabwe.
              </p>
              <ConsultationBooking
                trigger={
                  <Button className="btn-accent px-8 py-3">
                    Ask Our Assistant
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