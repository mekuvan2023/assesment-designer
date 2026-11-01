
import React from 'react';
import { useLanguage } from './LanguageProvider';
import { Linkedin, LinkTree, WhatsAppIcon } from './icons';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-base font-bold text-black mb-3">
          {t('appCredit')}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-5">
          <a
            href="https://www.linkedin.com/in/kerengr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-extrabold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <Linkedin className="w-4 h-4 text-secondary" />
            {t('footerLinkedin')}
          </a>
          <a
            href="https://ai-tools-academic-navigator-82a3c576.base44.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-extrabold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <LinkTree className="w-4 h-4 text-secondary" />
            {t('footerLinktree')}
          </a>
          <a
            href={t('whatsappLinkURL') as string}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            {t('whatsappLabel')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
