
import React from 'react';
import { useLanguage } from './LanguageProvider';
import { AppStep, Language } from '../types';
import { BookPenIcon, GridIcon, PlusCircleIcon, BookOpenIcon, SparkleIcon } from './icons';

interface SidebarProps {
  currentStep: AppStep;
  navigateTo: (step: AppStep) => void;
  onStartNewTest: () => void;
  testsCreated: number;
  questionsBanked: number;
  onOpenPromptModal?: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}> = ({ icon, label, isActive, onClick, isDisabled }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : isDisabled 
        ? 'text-text-light/50 cursor-not-allowed'
        : 'text-text-light hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentStep, navigateTo, onStartNewTest, testsCreated, questionsBanked, onOpenPromptModal }) => {
  const { t, language, setLanguage } = useLanguage();

  const isStepActive = (step: AppStep) => {
    if (step === AppStep.CREATE_TEST) {
        return [AppStep.SETUP, AppStep.CONFIGURATION, AppStep.GENERATING, AppStep.REVIEW, AppStep.REVIEW_GENERATE].includes(currentStep);
    }
    return currentStep === step;
  }

  const handleLanguageSwitch = () => {
    setLanguage(language === Language.EN ? Language.HE : Language.EN);
  };

  return (
    <aside className="w-64 bg-sidebar flex flex-col p-4 border-r border-gray-200/80 shadow-sm">
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="bg-secondary/10 p-1.5 rounded-lg">
           <BookPenIcon className="w-7 h-7 text-secondary" />
        </div>
        <h1 className="text-base font-bold text-text-main leading-tight">{t('appName')}</h1>
      </div>

      <nav className="flex-grow">
        <h2 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('navigation')}</h2>
        <div className="space-y-1">
          <NavItem
            icon={<GridIcon className="w-5 h-5" />}
            label={t('dashboard')}
            isActive={isStepActive(AppStep.DASHBOARD)}
            onClick={() => navigateTo(AppStep.DASHBOARD)}
          />
          <NavItem
            icon={<PlusCircleIcon className="w-5 h-5" />}
            label={t('createTest')}
            isActive={isStepActive(AppStep.CREATE_TEST)}
            onClick={onStartNewTest}
          />
          <NavItem
            icon={<BookOpenIcon className="w-5 h-5" />}
            label={t('questionBank')}
            isActive={isStepActive(AppStep.QUESTION_BANK)}
            onClick={() => navigateTo(AppStep.QUESTION_BANK)}
          />
          {onOpenPromptModal && (
            <button
              onClick={onOpenPromptModal}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-purple-700 bg-purple-50/80 hover:bg-purple-100 hover:text-purple-900 border border-purple-200/70"
            >
              <SparkleIcon className="w-5 h-5 text-purple-600" />
              <span>{t('masterPromptBtn')}</span>
            </button>
          )}
        </div>
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <button
            onClick={handleLanguageSwitch}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all bg-gradient-to-r from-[#D946EF] via-[#A855F7] to-[#7E22CE]"
        >
          <SparkleIcon className="w-4 h-4" />
          {t('languageSwitchTo')}
        </button>
        <div className="text-center px-1">
           <p className="text-xs text-text-light font-medium leading-tight">
             {t('appCredit')}
           </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
