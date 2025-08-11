import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertContactSchema } from '@shared/schema';
import { MapPin, Phone, Mail, Clock, Navigation, Linkedin, Twitter, Instagram } from 'lucide-react';

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  newsletter: boolean;
};

const contactFormSchema = insertContactSchema.extend({
  firstName: insertContactSchema.shape.firstName,
  lastName: insertContactSchema.shape.lastName,
  email: insertContactSchema.shape.email,
  company: insertContactSchema.shape.company.optional(),
  service: insertContactSchema.shape.service.optional(),
  message: insertContactSchema.shape.message,
  newsletter: insertContactSchema.shape.newsletter,
});

export function ContactSection() {
  const { t } = useTranslation();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      service: '',
      message: '',
      newsletter: false,
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. We will get back to you soon.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                {t('contact.form.title')}
              </h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.form.firstName')} *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('contact.form.placeholders.firstName')} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.form.lastName')} *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('contact.form.placeholders.lastName')} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.email')} *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder={t('contact.form.placeholders.email')} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.company')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('contact.form.placeholders.company')} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.service')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('contact.form.services.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="regulatory-compliance">
                              {t('contact.form.services.regulatory')}
                            </SelectItem>
                            <SelectItem value="ai-advisory">
                              {t('contact.form.services.ai')}
                            </SelectItem>
                            <SelectItem value="business-strategy">
                              {t('contact.form.services.strategy')}
                            </SelectItem>
                            <SelectItem value="training">
                              {t('contact.form.services.training')}
                            </SelectItem>
                            <SelectItem value="document-services">
                              {t('contact.form.services.documents')}
                            </SelectItem>
                            <SelectItem value="support">
                              {t('contact.form.services.support')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.message')} *</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={4}
                            placeholder={t('contact.form.placeholders.message')} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-gray-600">
                            {t('contact.form.newsletter')}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full btn-primary py-4" 
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? 'Sending...' : t('contact.form.send')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Office Information */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  {t('contact.office.title')}
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {t('contact.office.address')}
                      </h4>
                      <p className="text-gray-600">
                        15th Floor, Eastgate Shopping Centre<br />
                        Robert Mugabe Road<br />
                        Harare, Zimbabwe
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {t('contact.office.phone')}
                      </h4>
                      <p className="text-gray-600">+263 4 123 4567</p>
                      <p className="text-gray-600">+263 77 123 4567</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {t('contact.office.email')}
                      </h4>
                      <p className="text-gray-600">info@ipeace.co.zw</p>
                      <p className="text-gray-600">support@ipeace.co.zw</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {t('contact.office.hours')}
                      </h4>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                      <p className="text-sm text-accent-yellow font-medium mt-1">
                        AI Chat: 24/7 Available
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Find Us</h3>
                
                <div className="bg-gray-100 h-64 rounded-lg mb-4 overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3798.418307777772!2d31.05320531540447!3d-17.82654097564207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931a0e4a205515f%3A0x5b7e4a0a4e4b4a0!2sEastgate%20Shopping%20Centre!5e0!3m2!1sen!2szw!4v1650000000000!5m2!1sen!2szw"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                <Button
                  className="w-full btn-accent py-3"
                  onClick={() => {
                    window.open('https://www.google.com/maps/dir/?api=1&destination=Eastgate+Shopping+Centre,+Harare,+Zimbabwe', '_blank');
                  }}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {t('contact.office.directions')}
                </Button>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  {t('contact.social.title')}
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 border border-gray-200 hover:border-primary-blue hover:bg-blue-50 transition-all duration-200 group h-auto"
                    onClick={() => window.open('https://linkedin.com/company/ipeace', '_blank')}
                  >
                    <Linkedin className="h-6 w-6 text-gray-600 group-hover:text-primary-blue mb-2" />
                    <span className="text-sm text-gray-600 group-hover:text-primary-blue">LinkedIn</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 border border-gray-200 hover:border-primary-blue hover:bg-blue-50 transition-all duration-200 group h-auto"
                    onClick={() => window.open('https://twitter.com/ipeace', '_blank')}
                  >
                    <Twitter className="h-6 w-6 text-gray-600 group-hover:text-primary-blue mb-2" />
                    <span className="text-sm text-gray-600 group-hover:text-primary-blue">Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 border border-gray-200 hover:border-primary-blue hover:bg-blue-50 transition-all duration-200 group h-auto"
                    onClick={() => window.open('https://instagram.com/ipeace', '_blank')}
                  >
                    <Instagram className="h-6 w-6 text-gray-600 group-hover:text-primary-blue mb-2" />
                    <span className="text-sm text-gray-600 group-hover:text-primary-blue">Instagram</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
