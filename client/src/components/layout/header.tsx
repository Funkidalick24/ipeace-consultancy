import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Menu } from 'lucide-react';

export function Header() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { key: 'home', href: '#home' },
    { key: 'about', href: '#about' },
    { key: 'services', href: '#services' },
    { key: 'team', href: '#team' },
    { key: 'contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-100">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="IPEACE Logo"
                className="h-10 w-auto"
              />
            </a>
            <div className="hidden sm:block ml-2 text-sm text-gray-600">
              Professional Consulting
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-primary-blue transition-colors duration-200 font-medium"
              >
                {t(`nav.${item.key}`)}
              </button>
            ))}
          </div>

          {/* Language Toggle & CTA */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <Button
              className="hidden lg:block btn-accent px-4 py-2 rounded-md font-medium"
              onClick={() => {
                // Scroll to contact section and open consultation modal
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  // We could also trigger the consultation modal here if needed
                }
              }}
            >
              {t('nav.getConsultation')}
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => scrollToSection(item.href)}
                      className="text-left py-2 text-gray-700 hover:text-primary-blue transition-colors duration-200"
                    >
                      {t(`nav.${item.key}`)}
                    </button>
                  ))}
                  <Button
                    className="btn-accent mt-4 w-full"
                    onClick={() => {
                      // Scroll to contact section
                      const contactSection = document.querySelector('#contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setIsOpen(false); // Close mobile menu
                      }
                    }}
                  >
                    {t('nav.getConsultation')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
