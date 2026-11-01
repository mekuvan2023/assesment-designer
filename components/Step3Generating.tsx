
import React from 'react';
import { useLanguage } from './LanguageProvider';

const Step3Generating: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-32 h-32 border-8 border-pink-200 border-t-secondary rounded-full animate-spin"></div>
      <p className="mt-8 text-2xl font-semibold text-text-main">{t('generatingText')}</p>
    </div>
  );
};

export default Step3Generating;