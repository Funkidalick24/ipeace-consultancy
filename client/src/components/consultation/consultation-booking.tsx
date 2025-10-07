import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { consultationBookingSchema, type ConsultationBookingForm } from '@shared/schema';
import { Calendar, Clock, CheckCircle, CalendarDays } from 'lucide-react';
import DOMPurify from 'dompurify';

interface ConsultationBookingProps {
  trigger?: React.ReactNode;
  className?: string;
}

interface BookingSuccess {
  success: boolean;
  message: string;
  bookingId: string;
  booking: any;
}

export const ConsultationBooking = memo(function ConsultationBooking({ trigger, className }: ConsultationBookingProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingSuccess | null>(null);
  const [countdown, setCountdown] = useState(10);

  // Auto-close modal after successful booking
  useEffect(() => {
    if (bookingSuccess) {
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            resetForm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [bookingSuccess]);

  const form = useForm<ConsultationBookingForm>({
    resolver: zodResolver(consultationBookingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      serviceType: undefined,
      preferredDate: '',
      preferredTime: undefined,
      consultationType: undefined,
      description: '',
      newsletter: false,
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: ConsultationBookingForm): Promise<BookingSuccess> => {
      const response = await apiRequest('POST', '/api/consultations', data);
      return response.json();
    },
    onSuccess: (data) => {
      setBookingSuccess(data);
      toast({
        title: "Consultation booked successfully!",
        description: "We will contact you soon to confirm your appointment.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error booking consultation",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsultationBookingForm) => {
    // Sanitize user input before sending to server
    const sanitizedData = {
      firstName: DOMPurify.sanitize(data.firstName),
      lastName: DOMPurify.sanitize(data.lastName),
      email: DOMPurify.sanitize(data.email),
      phone: DOMPurify.sanitize(data.phone),
      company: data.company ? DOMPurify.sanitize(data.company) : undefined,
      serviceType: DOMPurify.sanitize(data.serviceType),
      preferredDate: DOMPurify.sanitize(data.preferredDate),
      preferredTime: DOMPurify.sanitize(data.preferredTime),
      consultationType: DOMPurify.sanitize(data.consultationType),
      description: DOMPurify.sanitize(data.description)
    };
    
    bookingMutation.mutate(sanitizedData as ConsultationBookingForm);
  };

  const resetForm = () => {
    form.reset();
    setBookingSuccess(null);
    setCountdown(10);
    setIsOpen(false);
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const defaultTrigger = (
    <Button className={`btn-accent px-6 py-3 rounded-lg font-semibold ${className}`}>
      <CalendarDays className="mr-2 h-5 w-5" />
      {t('consultation.title')}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl md:text-2xl font-bold text-primary-blue">
            <Calendar className="mr-3 h-6 w-6" />
            {t('consultation.title')}
          </DialogTitle>
        </DialogHeader>

        {bookingSuccess ? (
          // Success State
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                {t('consultation.success.title')}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('consultation.success.message')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  {t('consultation.success.bookingId')}: <span className="font-semibold">#{bookingSuccess.bookingId}</span>
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  This window will close automatically in <span className="font-semibold">{countdown}</span> seconds
                </p>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-primary-blue mb-3">
                  {t('consultation.success.nextSteps')}
                </h4>
                <ul className="space-y-2">
                  {(t('consultation.success.steps', { returnObjects: true }) as string[]).map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-blue text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={resetForm} className="w-full btn-primary" aria-label={t('consultation.success.bookAnother')}>
              {t('consultation.success.bookAnother')}
            </Button>
          </div>
        ) : (
          // Booking Form
          <div className="space-y-6">
            <p className="text-gray-700">{t('consultation.subtitle')}</p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('consultation.form.firstName')} *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('consultation.form.placeholders.firstName')}
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
                        <FormLabel>{t('consultation.form.lastName')} *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('consultation.form.placeholders.lastName')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('consultation.form.email')} *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t('consultation.form.placeholders.email')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('consultation.form.phone')} *</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t('consultation.form.placeholders.phone')}
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
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">{t('consultation.form.company')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('consultation.form.placeholders.company')}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('consultation.form.serviceType')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('consultation.form.serviceTypes.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="regulatory">
                              {t('consultation.form.serviceTypes.regulatory')}
                            </SelectItem>
                            <SelectItem value="ai">
                              {t('consultation.form.serviceTypes.ai')}
                            </SelectItem>
                            <SelectItem value="strategy">
                              {t('consultation.form.serviceTypes.strategy')}
                            </SelectItem>
                            <SelectItem value="training">
                              {t('consultation.form.serviceTypes.training')}
                            </SelectItem>
                            <SelectItem value="documents">
                              {t('consultation.form.serviceTypes.documents')}
                            </SelectItem>
                            <SelectItem value="support">
                              {t('consultation.form.serviceTypes.support')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consultationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('consultation.form.consultationType')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('consultation.form.consultationTypes.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-person">
                              {t('consultation.form.consultationTypes.in-person')}
                            </SelectItem>
                            <SelectItem value="video-call">
                              {t('consultation.form.consultationTypes.video-call')}
                            </SelectItem>
                            <SelectItem value="phone-call">
                              {t('consultation.form.consultationTypes.phone-call')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('consultation.form.preferredDate')} *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={minDate}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('consultation.form.preferredTime')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('consultation.form.timeSlots.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="morning-9">
                              {t('consultation.form.timeSlots.morning-9')}
                            </SelectItem>
                            <SelectItem value="morning-10">
                              {t('consultation.form.timeSlots.morning-10')}
                            </SelectItem>
                            <SelectItem value="morning-11">
                              {t('consultation.form.timeSlots.morning-11')}
                            </SelectItem>
                            <SelectItem value="afternoon-2">
                              {t('consultation.form.timeSlots.afternoon-2')}
                            </SelectItem>
                            <SelectItem value="afternoon-3">
                              {t('consultation.form.timeSlots.afternoon-3')}
                            </SelectItem>
                            <SelectItem value="afternoon-4">
                              {t('consultation.form.timeSlots.afternoon-4')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('consultation.form.description')} *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={t('consultation.form.placeholders.description')}
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
                        <FormLabel className="text-sm text-gray-700">
                          Subscribe to our newsletter
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full btn-primary py-4"
                  disabled={bookingMutation.isPending}
                  aria-label={bookingMutation.isPending ? t('consultation.form.booking') : t('consultation.form.book')}
                >
                  {bookingMutation.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      {t('consultation.form.booking')}
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('consultation.form.book')}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});