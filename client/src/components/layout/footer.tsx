import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Linkedin, Twitter, Instagram } from 'lucide-react';
import { LegalPopup } from '@/components/legal/legal-popup';

export function Footer() {
  const { t } = useTranslation();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-primary-blue text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="text-3xl font-bold mb-4">IPEACE</div>
            <p className="text-blue-200 mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-blue-700 rounded-lg hover:bg-accent-yellow hover:text-primary-blue transition-all duration-200"
                onClick={() => window.open('https://linkedin.com/company/ipeace', '_blank')}
              >
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-blue-700 rounded-lg hover:bg-accent-yellow hover:text-primary-blue transition-all duration-200"
                onClick={() => window.open('https://twitter.com/ipeace', '_blank')}
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-blue-700 rounded-lg hover:bg-accent-yellow hover:text-primary-blue transition-all duration-200"
                onClick={() => window.open('https://instagram.com/ipeace', '_blank')}
              >
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {['home', 'about', 'services', 'team', 'contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(`#${item}`)}
                    className="text-blue-200 hover:text-white transition-colors duration-200"
                  >
                    {t(`nav.${item}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('#services')}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  {t('contact.form.services.regulatory')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#services')}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  {t('contact.form.services.ai')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#services')}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  {t('contact.form.services.strategy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#services')}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  {t('contact.form.services.training')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#services')}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  {t('contact.form.services.support')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-200 text-sm">{t('footer.copyright')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <LegalPopup type="privacy">
              <button className="text-blue-200 hover:text-white text-sm transition-colors duration-200">
                {t('footer.privacy')}
              </button>
            </LegalPopup>
            <LegalPopup type="terms">
              <button className="text-blue-200 hover:text-white text-sm transition-colors duration-200">
                {t('footer.terms')}
              </button>
            </LegalPopup>
            <button
              onClick={() => alert('Cookie Policy page coming soon')}
              className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
            >
              {t('footer.cookies')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
