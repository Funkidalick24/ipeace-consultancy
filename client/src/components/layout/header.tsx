import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Menu } from 'lucide-react';

export const Header = memo(function Header() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { key: 'home', href: '/', isPage: true },
    { key: 'about', href: '/about', isPage: true },
    { key: 'services', href: '/services', isPage: true },
    { key: 'faq', href: '/faq', isPage: true },
    { key: 'resources', href: '/resources', isPage: true },
    { key: 'contact', href: '/contact', isPage: true },
  ];

  const handleNavigation = (item: { href: string; isPage?: boolean }) => {
    if (item.isPage) {
      // Navigate to page using wouter
      window.location.href = item.href;
    } else {
      // Scroll to section
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
width="180"
                height="180"
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
                onClick={() => handleNavigation(item)}
                className="text-gray-700 hover:text-primary-blue transition-colors duration-200 font-medium"
                aria-label={t(`nav.${item.key}`)}
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
                window.location.href = '/contact';
              }}
            >
              {t('nav.getConsultation')}
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleNavigation(item)}
                      className="text-left py-2 text-gray-700 hover:text-primary-blue transition-colors duration-200"
                      aria-label={t(`nav.${item.key}`)}
                    >
                      {t(`nav.${item.key}`)}
                    </button>
                  ))}
                  <Button
                    className="btn-accent mt-4 w-full"
                    onClick={() => {
                      window.location.href = '/contact';
                      setIsOpen(false); // Close mobile menu
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
});
