import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import enTranslations from '../locales/en.json';
import snTranslations from '../locales/sn.json';

const resources = {
  en: { translation: enTranslations },
  sn: { translation: snTranslations },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale.split('-')[0] || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

interface I18nContextType {
  language: string;
  changeLanguage: (lang: string) => void;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  changeLanguage: () => {},
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <I18nContext.Provider value={{ language, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};