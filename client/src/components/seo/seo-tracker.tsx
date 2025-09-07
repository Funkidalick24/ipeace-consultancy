import { useEffect } from 'react';

// SEO and Analytics Tracking Component
export const SEOTracker = () => {
  useEffect(() => {
    // Track page views and engagement
    const trackEngagement = () => {
      // Track time on page
      const startTime = Date.now();

      const trackPageLeave = () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);

        // Send to Google Analytics if available
        if (window.gtag) {
          window.gtag('event', 'page_leave', {
            'event_category': 'engagement',
            'event_label': window.location.pathname,
            'value': timeSpent,
            'custom_map': {'metric1': timeSpent}
          });
        }

        // Track scroll depth
        const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        if (window.gtag) {
          window.gtag('event', 'scroll_depth', {
            'event_category': 'engagement',
            'event_label': `${scrollDepth}%`,
            'value': scrollDepth
          });
        }
      };

      // Track when user leaves the page
      window.addEventListener('beforeunload', trackPageLeave);

      // Track scroll events
      let maxScroll = 0;
      const trackScroll = () => {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll && scrollPercent >= 25) {
          maxScroll = scrollPercent;
          if (window.gtag) {
            window.gtag('event', 'scroll_milestone', {
              'event_category': 'engagement',
              'event_label': `${scrollPercent}%_scrolled`,
              'value': scrollPercent
            });
          }
        }
      };

      window.addEventListener('scroll', trackScroll);

      return () => {
        window.removeEventListener('beforeunload', trackPageLeave);
        window.removeEventListener('scroll', trackScroll);
      };
    };

    // Track clicks on important elements
    const trackClicks = () => {
      const trackElement = (selector: string, eventName: string) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.addEventListener('click', () => {
            if (window.gtag) {
              window.gtag('event', 'click', {
                'event_category': 'engagement',
                'event_label': eventName,
                'transport_type': 'beacon'
              });
            }
          });
        });
      };

      // Track CTA button clicks
      trackElement('.btn-primary, .btn-accent', 'cta_click');
      // Track service link clicks
      trackElement('[href*="services"]', 'service_link_click');
      // Track contact form interactions
      trackElement('#contact form', 'contact_form_interaction');
      // Track chatbot interactions
      trackElement('[data-chatbot]', 'chatbot_interaction');
    };

    // Initialize tracking
    trackEngagement();
    trackClicks();

    // Track form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', () => {
        if (window.gtag) {
          window.gtag('event', 'form_submit', {
            'event_category': 'conversion',
            'event_label': form.id || 'contact_form'
          });
        }
      });
    });

  }, []);

  // This component doesn't render anything visible
  return null;
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}