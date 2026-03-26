import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n: i18nInstance } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  const changeLanguage = (langCode) => {
    i18nInstance.changeLanguage(langCode);
    setCurrentLanguage(langCode);
    
    // Update document direction for RTL
    const isRTL = langCode === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
    
    // Store in localStorage
    localStorage.setItem('language', langCode);
  };

  useEffect(() => {
    // Load saved language
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['en', 'ar', 'fr'].includes(savedLanguage)) {
      changeLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (['ar', 'fr'].includes(browserLang)) {
        changeLanguage(browserLang);
      }
    }
  }, []);

  const value = {
    currentLanguage,
    changeLanguage,
    isRTL: currentLanguage === 'ar',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};