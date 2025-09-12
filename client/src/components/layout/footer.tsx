import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Linkedin, Instagram, Facebook } from 'lucide-react';
import { LegalPopup } from '@/components/legal/legal-popup';


export const Footer = memo(function Footer() {
  const { t } = useTranslation();

  const navigateToPage = (path: string) => {
    window.location.href = path;
  };

  return (
    <footer className="bg-primary-blue text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="text-2xl md:text-3xl font-bold mb-4">IPEACE</div>
            <p className="text-blue-100 mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-blue-700 rounded-lg hover:bg-accent-yellow hover:text-primary-blue transition-all duration-200"
                onClick={() => window.open('https://www.linkedin.com/company/ipeace-consultancy/', '_blank')}
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-blue-700 rounded-lg hover:bg-accent-yellow hover:text-primary-blue transition-all duration-200"
                onClick={() => window.open('https://www.facebook.com/share/17BxG8keoB/?mibextid=wwXIfr', '_blank')}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-blue-700 rounded-lg hover:bg-accent-yellow hover:text-primary-blue transition-all duration-200"
                onClick={() => window.open('https://www.instagram.com/ipeace_consultancy?igsh=MWJpc2VxY2d4MDYxaQ%3D%3D&utm_source=qr', '_blank')}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateToPage('/')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('nav.home')}
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/about')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('nav.about')}
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/services')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('nav.services')}
                >
                  {t('nav.services')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/faq')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('nav.faq')}
                >
                  {t('nav.faq')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/blogs')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('nav.blog')}
                >
                  {t('nav.blog')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/contact')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('nav.contact')}
                >
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateToPage('/services')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('contact.form.services.regulatory')}
                >
                  {t('contact.form.services.regulatory')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/services')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('contact.form.services.ai')}
                >
                  {t('contact.form.services.ai')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/services')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('contact.form.services.strategy')}
                >
                  {t('contact.form.services.strategy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/services')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('contact.form.services.training')}
                >
                  {t('contact.form.services.training')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPage('/services')}
                  className="text-blue-100 hover:text-white transition-colors duration-200"
                  aria-label={t('contact.form.services.support')}
                >
                  {t('contact.form.services.support')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-100 text-sm">{t('footer.copyright')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <LegalPopup type="privacy">
              <button className="text-blue-100 hover:text-white text-sm transition-colors duration-200" aria-label={t('footer.privacy')}>
                {t('footer.privacy')}
              </button>
            </LegalPopup>
            <LegalPopup type="terms">
              <button className="text-blue-100 hover:text-white text-sm transition-colors duration-200" aria-label={t('footer.terms')}>
                {t('footer.terms')}
              </button>
            </LegalPopup>
            <button
              onClick={() => navigateToPage('/admin')}
              className="text-blue-100 hover:text-white text-sm transition-colors duration-200"
              aria-label="Admin Portal"
            >
              Portal
            </button>
            <button
              onClick={() => alert('Cookie Policy page coming soon')}
              className="text-blue-100 hover:text-white text-sm transition-colors duration-200"
              aria-label={t('footer.cookies')}
            >
              {t('footer.cookies')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
});
