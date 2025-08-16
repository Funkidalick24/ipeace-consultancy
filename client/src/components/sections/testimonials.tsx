import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "IPEACE transformed our compliance processes with their AI-powered solutions. What used to take weeks now takes hours, and we have complete confidence in our regulatory adherence.",
    name: "Michael Chigamba",
    position: "CEO, Zimbabwe Mining Corporation",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    quote: "The bilingual support and local expertise made all the difference in our expansion strategy. IPEACE truly understands the Zimbabwean business landscape.",
    name: "Sarah Moyo",
    position: "Founder, TechHub Zimbabwe",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    quote: "Outstanding responsiveness and depth of knowledge. IPEACE is truly a partner, not just a service provider. Their AI chatbot is incredibly accurate.",
    name: "Robert Madziva",
    position: "Director, Sunrise Investments",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    quote: "Their AI chatbot saved us countless hours and the human experts are always available when needed. Perfect blend of technology and expertise.",
    name: "Linda Kupara",
    position: "CFO, AgriTech Solutions",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  }
];

const additionalTestimonials = [
  {
    quote: "The bilingual support and local expertise made all the difference in our expansion strategy.",
    name: "Sarah Moyo",
    position: "Founder, TechHub Zimbabwe",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
  },
  {
    quote: "Outstanding responsiveness and depth of knowledge. IPEACE is truly a partner, not just a service provider.",
    name: "Robert Madziva",
    position: "Director, Sunrise Investments",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
  },
  {
    quote: "Their AI chatbot saved us countless hours and the human experts are always available when needed.",
    name: "Linda Kupara",
    position: "CFO, AgriTech Solutions",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80"
  }
];

export function TestimonialsSection() {
  const { t } = useTranslation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
                "{testimonials[currentTestimonial].quote}"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <img 
                  src={testimonials[currentTestimonial].image}
                  alt={`${testimonials[currentTestimonial].name} - ${testimonials[currentTestimonial].position}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-700">
                    {testimonials[currentTestimonial].position}
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
              />
            ))}
          </div>
        </div>

        {/* Additional testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {additionalTestimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <Quote className="text-2xl text-primary-blue mb-4 h-8 w-8" />
                <p className="text-gray-800 mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial.image}
                    alt={`${testimonial.name} - ${testimonial.position}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-gray-700 text-xs">{testimonial.position}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
