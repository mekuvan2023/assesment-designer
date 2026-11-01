
import React from 'react';
import { Language } from '../types';
import { useLanguage } from './LanguageProvider';
import { BrainCircuit } from './icons';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary">{t('appName')}</h1>
            <p className="text-sm text-gray-500">{t('tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="language-select" className="sr-only">{t('selectLanguage')}</label>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block p-2"
          >
            <option value={Language.EN}>English</option>
            <option value={Language.HE}>עברית</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
