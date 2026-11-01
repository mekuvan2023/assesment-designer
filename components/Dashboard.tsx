
import React from 'react';
import { useLanguage } from './LanguageProvider';
import { AppStep, Test, Question } from '../types';
import { FileTextIcon, LightbulbIcon, BookIcon, TargetIcon, ArrowRightIcon, PlusCircleIcon, BookOpenIcon, AnalyticsIcon, SparkleIcon, TrashIcon, SparklesIcon } from './icons';

interface DashboardProps {
  tests: Test[];
  questionBank: Question[];
  navigateTo: (step: AppStep) => void;
  onStartNewTest: () => void;
  onSelectTest: (test: Test) => void;
  onRemixTest: (id: string) => void;
  onRebuildTest: (id: string) => void;
  onDeleteTest: (id: string) => void;
}

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle: string;
    color: 'purple' | 'pink' | 'green' | 'orange';
}> = ({ icon, label, value, subtitle, color }) => {
    const colorClasses = {
        purple: 'bg-primary',
        pink: 'bg-secondary',
        green: 'bg-accent',
        orange: 'bg-orange-500',
    };

    return (
        <div className="bg-card-bg p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className={`p-3.5 rounded-xl text-white shrink-0 ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-text-light font-medium">{label}</p>
                <p className="text-2xl font-bold text-text-main leading-tight">{value}</p>
                <p className="text-xs text-text-light">{subtitle}</p>
            </div>
        </div>
    );
};

const ActionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    isDisabled?: boolean;
}> = ({ icon, title, description, onClick, isDisabled }) => {
    return (
        <button 
            onClick={onClick} 
            disabled={isDisabled}
            className="w-full bg-card-bg p-5 rounded-2xl shadow-sm flex items-center text-left hover:shadow-md transition-shadow duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
        >
            <div className="bg-gray-100 p-3 rounded-lg mr-4">
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-text-main">{title}</h3>
                <p className="text-sm text-text-light">{description}</p>
            </div>
             <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors ml-2" />
        </button>
    );
};



const Dashboard: React.FC<DashboardProps> = ({ tests, questionBank, navigateTo, onStartNewTest, onSelectTest, onRemixTest, onRebuildTest, onDeleteTest }) => {
  const { t } = useLanguage();

  const totalQuestions = tests.reduce((sum, test) => sum + test.questions.length, 0);
  const avgQuestions = tests.length > 0 ? (totalQuestions / tests.length).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-text-main">{t('welcome')}</h1>
            <p className="text-text-light">{t('welcomeSubtitle')}</p>
        </header>

        <section className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FileTextIcon className="w-6 h-6"/>} label={t('statTotalTests')} value={tests.length} subtitle={t('statTotalTestsSubtitle')} color="purple"/>
                <StatCard icon={<LightbulbIcon className="w-6 h-6"/>} label={t('statTotalQuestions')} value={totalQuestions} subtitle={t('statTotalQuestionsSubtitle')} color="pink"/>
                <StatCard icon={<BookIcon className="w-6 h-6"/>} label={t('statQuestionsInBank')} value={questionBank.length} subtitle={t('statQuestionsInBankSubtitle')} color="green"/>
                <StatCard icon={<TargetIcon className="w-6 h-6"/>} label={t('statAvgQuestions')} value={avgQuestions} subtitle={t('statAvgQuestionsSubtitle')} color="orange"/>
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <section className="lg:col-span-1">
                <h2 className="text-xl font-bold text-text-main mb-4">{t('quickActions')}</h2>
                <div className="space-y-4">
                    <ActionCard 
                        icon={<PlusCircleIcon className="w-7 h-7 text-primary"/>}
                        title={t('createNewTest')}
                        description={t('createNewTestDesc')}
                        onClick={onStartNewTest}
                    />
                    <ActionCard
                        icon={<BookOpenIcon className="w-7 h-7 text-accent"/>}
                        title={t('browseQuestionBank')}
                        description={t('browseQuestionBankDesc')}
                        onClick={() => navigateTo(AppStep.QUESTION_BANK)}
                    />
                     <ActionCard
                        icon={<AnalyticsIcon className="w-7 h-7 text-orange-500"/>}
                        title={t('viewAnalytics')}
                        description={t('viewAnalyticsDesc')}
                        onClick={() => {}}
                        isDisabled={true}
                    />
                </div>
            </section>
            
            <section className="lg:col-span-2">
                <h2 className="text-xl font-bold text-text-main mb-4">{t('recentTests')}</h2>
                <div className="space-y-3">
                    {tests.length === 0 ? (
                        <div className="bg-card-bg p-6 rounded-2xl shadow-sm text-center min-h-[200px] flex flex-col justify-center items-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <FileTextIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-text-light font-medium">{t('noTestsCreated')}</p>
                        </div>
                    ) : (
                        tests.map((test) => (
                            <div key={test.id} className="bg-card-bg p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTest(test)}>
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                            <FileTextIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-main group-hover:text-primary transition-colors">{test.title}</h3>
                                            <p className="text-xs text-text-light">
                                                {test.questions.length} questions • {new Date(test.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button 
                                            title={t('remix')}
                                            onClick={() => onRemixTest(test.id)}
                                            className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg"
                                        >
                                            <SparkleIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            title={t('rebuild')}
                                            onClick={() => onRebuildTest(test.id)}
                                            className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg"
                                        >
                                            <SparklesIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            title={t('delete')}
                                            onClick={() => onDeleteTest(test.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <button 
                                        onClick={() => onSelectTest(test)}
                                        className="text-xs font-bold py-1.5 px-3 bg-primary/5 text-primary rounded-md hover:bg-primary/10 transition"
                                    >
                                        Review
                                    </button>
                                    <button 
                                        onClick={() => {
                                            onSelectTest(test);
                                            // Handle redirection to practice mode? We'd need a specific trigger here.
                                            // For now, reviewing is the primary path.
                                        }}
                                        className="text-xs font-bold py-1.5 px-3 bg-secondary/5 text-secondary rounded-md hover:bg-secondary/10 transition"
                                    >
                                        Practice
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>

        {tests.length === 0 && (
             <section className="mt-12 text-center bg-card-bg p-8 rounded-2xl shadow-sm border border-gray-200/80">
                <div className="w-16 h-16 bg-pink-100 text-secondary mx-auto rounded-full flex items-center justify-center mb-4">
                    <PlusCircleIcon className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-text-main">{t('readyToCreateTitle')}</h2>
                <p className="max-w-2xl mx-auto text-text-light mt-2 mb-6">{t('readyToCreateDesc')}</p>
                <button
                    onClick={onStartNewTest} 
                    className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-secondary to-orange-400 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                    {t('createFirstTestBtn')}
                </button>
            </section>
        )}
    </div>
  );
};

export default Dashboard;
