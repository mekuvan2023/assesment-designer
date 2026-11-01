
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language } from '../types';
import { I18N } from '../constants';

type I18nStructure = typeof I18N[Language.EN];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <K extends keyof I18nStructure>(key: K) => I18nStructure[K];
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(Language.HE);

  const t = <K extends keyof I18nStructure>(key: K): I18nStructure[K] => {
    const value = I18N[language][key] || I18N[Language.EN][key];
    // The cast is necessary because TypeScript widens the return type to `string | string[]`
    // instead of the specific type associated with the key K.
    return value as I18nStructure[K];
  };
  
  const dir = language === Language.HE ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
