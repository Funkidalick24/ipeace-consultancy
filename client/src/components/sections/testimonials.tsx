import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, User } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating?: number;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const TestimonialsSection = memo(function TestimonialsSection() {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.testimonials || []);
        } else {
          console.error('Failed to fetch testimonials');
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>
          <div className="text-center">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>
          <div className="text-center text-gray-600">
            No testimonials available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-50 to-white shadow-lg border border-gray-100">
            <CardContent className="p-8 lg:p-12 text-center">
              <Quote className="text-4xl text-primary-blue mb-6 mx-auto h-12 w-12" />
              <blockquote className="text-lg md:text-xl lg:text-2xl text-gray-800 font-medium mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                {testimonials[currentTestimonial].imageUrl ? (
                  <img
                    src={testimonials[currentTestimonial].imageUrl}
                    alt={`${testimonials[currentTestimonial].name} - ${testimonials[currentTestimonial].position || ''}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-700">
                    {testimonials[currentTestimonial].position}
                    {testimonials[currentTestimonial].company && ` at ${testimonials[currentTestimonial].company}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full p-0 transition-all duration-200 ${
                  index === currentTestimonial
                    ? 'bg-primary-blue'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Additional testimonials grid */}
        {testimonials.length > 1 && (
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {testimonials.slice(1, 4).map((testimonial, index) => (
              <Card key={testimonial.id} className="bg-gray-50 border border-gray-100">
                <CardContent className="p-6">
                  <Quote className="text-2xl text-primary-blue mb-4 h-8 w-8" />
                  <p className="text-gray-800 mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    {testimonial.imageUrl ? (
                      <img
                        src={testimonial.imageUrl}
                        alt={`${testimonial.name} - ${testimonial.position || ''}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-gray-700 text-xs">
                        {testimonial.position}
                        {testimonial.company && ` at ${testimonial.company}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
