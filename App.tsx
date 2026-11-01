
import React, { useState, useEffect, useMemo } from 'react';
import { AppStep, Test, LearnerLevel, Question, BloomLevel, QuestionConfig, Language } from './types';
import { useLanguage } from './components/LanguageProvider';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Step1Setup from './components/Step1Setup';
import Step2Configuration from './components/Step2Configuration';
import Step3Generating from './components/Step3Generating';
import Step4Review from './components/Step4Review';
import PracticeSession from './components/PracticeSession';
import QuestionBank from './components/QuestionBank';
import { generateTestFromContent, balanceQuestionDistributions } from './services/geminiService';
import { CheckIcon, XIcon } from './components/icons';
import { PromptModal } from './components/PromptModal';

// Component for Step 4: Review & Generate
interface Step4ReviewGenerateProps {
  testTitle: string;
  learnerLevel: LearnerLevel;
  language: Language;
  topics: string[];
  config: QuestionConfig;
  isPracticeEnabled: boolean;
  onPracticeModeChange: (enabled: boolean) => void;
  onGenerate: () => void;
  onBack: () => void;
  onClose: () => void;
}

const Step4ReviewGenerate: React.FC<Step4ReviewGenerateProps> = ({
  testTitle,
  learnerLevel,
  language,
  topics,
  config,
  isPracticeEnabled,
  onPracticeModeChange,
  onGenerate,
  onBack,
  onClose,
}) => {
  const { t } = useLanguage();

  const stepperSteps = useMemo(() => [
      { name: t('step1_basicInfo') },
      { name: t('step3_config') },
      { name: t('step4_review') },
  ], [t]);

  const subTitle = `${testTitle || 'undefined'} ${t('stepperSubtitle')}`
    .replace('{step}', '3')
    .replace('{stepName}', t('step4_review'));

  const totals = useMemo(() => {
    const mcqTotal = Object.values(config.mcq).reduce((sum: number, val) => sum + Number(val), 0);
    const openEndedTotal = config.openEnded;
    return { mcqTotal, openEndedTotal, totalQuestions: mcqTotal + openEndedTotal };
  }, [config]);

  const learnerLevelDisplay = t('learnerLevels')[Object.values(LearnerLevel).indexOf(learnerLevel)] || learnerLevel;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onClose} aria-label={t('close')} className="absolute top-6 end-6 bg-gray-700 text-white rounded-full p-2 hover:bg-gray-900 transition-colors z-10">
          <XIcon className="w-5 h-5" />
      </button>
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-text-main">{t('createNewTestTitle')}</h1>
        <p className="text-text-light">{subTitle}</p>
      </header>
      
      <div className="mb-8 px-4">
        <div className="flex items-center">
            {stepperSteps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === 3;
                const isCompleted = stepNumber < 3;
                return (
                    <React.Fragment key={step.name}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${isActive ? 'bg-secondary text-white shadow-lg scale-110' : 'bg-pink-300 text-white'}`}>
                               {isCompleted ? <CheckIcon className="w-6 h-6" /> : stepNumber}
                            </div>
                            <div className={`mt-2 text-sm text-center font-semibold ${isActive ? 'text-text-main' : 'text-text-light'}`}>
                                {step.name}
                            </div>
                        </div>
                        {stepNumber < stepperSteps.length && <div className={`flex-auto border-t-2 mx-4 transition-colors duration-500 ease-in-out ${isCompleted || isActive ? 'border-pink-300' : 'border-gray-200'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
      </div>

      <div className="mt-8 bg-card-bg p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-text-main mb-6 text-center">{t('reviewAndGenerateTitle')}</h2>
        
        {/* Test Overview */}
        <section className="bg-pink-50 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold text-secondary mb-4">{t('testOverview')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><strong className="text-text-main">{t('level')}</strong> {learnerLevelDisplay}</div>
              <div><strong className="text-text-main">{t('language')}</strong> {language === 'en' ? 'English' : 'עברית'}</div>
              <div><strong className="text-text-main">{t('questionsLabel')}</strong> {totals.totalQuestions}</div>
              <div className="col-span-2 md:col-span-3"><strong className="text-text-main">{t('testTitle')}:</strong> {testTitle}</div>
              <div className="col-span-2 md:col-span-3"><strong className="text-text-main">{t('topics')}</strong> {topics.join(', ')}</div>
          </div>
        </section>

        {/* Question Breakdown */}
        <section className="mb-6">
          <h3 className="text-xl font-bold text-text-main mb-4">{t('questionBreakdown').replace('{mcqCount}', totals.mcqTotal.toString())}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-text-light">
            <span>{t('directQuestion')}: <strong className="text-text-main">{config.mcq.direct}</strong></span>
            <span>{t('completion')}: <strong className="text-text-main">{config.mcq.completion}</strong></span>
            <span>{t('caseBased')}: <strong className="text-text-main">{config.mcq.caseBased}</strong></span>
            <span>{t('negativeStem')}: <strong className="text-text-main">{config.mcq.negativeStem}</strong></span>
            <span>{t('matchingSequencing')}: <strong className="text-text-main">{config.mcq.matchingSequencing}</strong></span>
            <span>{t('causeEffect')}: <strong className="text-text-main">{config.mcq.causeEffect}</strong></span>
          </div>
          <h3 className="text-xl font-bold text-text-main mt-4 mb-2">{t('difficultyDistribution')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-text-light">
             <span>{t('easy')}: <strong className="text-text-main">{config.difficulty.easy}</strong></span>
             <span>{t('medium')}: <strong className="text-text-main">{config.difficulty.medium}</strong></span>
             <span>{t('hard')}: <strong className="text-text-main">{config.difficulty.hard}</strong></span>
          </div>
        </section>

        {/* Open-ended Questions */}
        <section className="mb-6">
            <h3 className="text-xl font-bold text-text-main">{t('openEndedQuestionsTitle')}</h3>
            <p className="text-text-light">{t('openEndedQuestionsCount').replace('{count}', config.openEnded.toString())}</p>
        </section>
        
        {/* Practice Mode */}
        <section className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
            <div>
                <h4 className="font-semibold text-text-main">{t('enablePracticeMode')}</h4>
                <p className="text-sm text-text-light">{t('practiceModeDesc')}</p>
            </div>
            <button
                type="button"
                onClick={() => onPracticeModeChange(!isPracticeEnabled)}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isPracticeEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                role="switch"
                aria-checked={isPracticeEnabled}
            >
                <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${isPracticeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </section>
      </div>
      
      <div className="mt-10 flex justify-between items-center">
            <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 bg-gray-200 text-text-light font-semibold rounded-lg hover:bg-gray-300 transition"
            >
                {t('back')}
            </button>
            <button
                type="button"
                onClick={onGenerate}
                className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-accent to-green-400 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
                {t('generateAssessment')}
            </button>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const { language, dir, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.DASHBOARD);

  // State for the test creation flow
  const [testTitle, setTestTitle] = useState<string>('');
  const [testLanguage, setTestLanguage] = useState<Language>(language);
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>(LearnerLevel.BA);
  const [topics, setTopics] = useState<string[]>([]);
  const [content, setContent] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [questionConfig, setQuestionConfig] = useState<QuestionConfig | null>(null);
  const [isPracticeEnabled, setIsPracticeEnabled] = useState<boolean>(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [allTests, setAllTests] = useState<Test[]>([]);
  const [questionBank, setQuestionBank] = useState<Question[]>([]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  useEffect(() => {
    try {
      const savedTests = localStorage.getItem('smart-builder-tests');
      if (savedTests) {
        setAllTests(JSON.parse(savedTests));
      }
      const savedBank = localStorage.getItem('smart-builder-bank');
      if (savedBank) {
        setQuestionBank(JSON.parse(savedBank));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('smart-builder-tests', JSON.stringify(allTests));
    } catch (error) {
      console.error("Failed to save tests to localStorage", error);
    }
  }, [allTests]);

  useEffect(() => {
    try {
      localStorage.setItem('smart-builder-bank', JSON.stringify(questionBank));
    } catch (error) {
      console.error("Failed to save question bank to localStorage", error);
    }
  }, [questionBank]);


  const handleSetupSubmit = (data: { title: string; language: Language; level: LearnerLevel; topics: string[], content: string, manualText: string }) => {
    setTestTitle(data.title);
    setTestLanguage(data.language);
    setLearnerLevel(data.level);
    setTopics(data.topics);
    setContent(data.content);
    setManualText(data.manualText);
    setCurrentStep(AppStep.CONFIGURATION);
  };

  const handleConfigurationProceed = (config: QuestionConfig) => {
    setQuestionConfig(config);
    setCurrentStep(AppStep.REVIEW_GENERATE);
  };

  const handleStartGeneration = async () => {
    if (!questionConfig) {
      console.error("Question config is not set.");
      navigateTo(AppStep.CONFIGURATION);
      return;
    }
    setCurrentStep(AppStep.GENERATING);
    try {
        const test = await generateTestFromContent(
            content,
            topics.join(', '),
            learnerLevel,
            testLanguage,
            questionConfig,
            testTitle,
        );
        handleTestGenerated(test);
    } catch (error) {
        console.error("Failed to generate test:", error);
        navigateTo(AppStep.DASHBOARD);
    }
  };

  const handleTestGenerated = (generatedTest: Test) => {
    const newTest: Test = { 
        ...generatedTest, 
        id: `test-${Date.now()}`, 
        learnerLevel: learnerLevel, 
        title: testTitle || generatedTest.title,
        practiceModeEnabled: isPracticeEnabled,
        language: testLanguage,
        sourceContent: content,
        sourceTopics: topics,
        sourceManualText: manualText,
        sourceConfig: questionConfig || undefined,
        createdAt: Date.now(),
    };
    setActiveTest(newTest);
    setAllTests(prevTests => [newTest, ...prevTests]);
    
    const bankQuestions = newTest.questions.map(({detailedExplanation, distractorExplanations, ...bankQ}) => bankQ);
    setQuestionBank(prevBank => [...prevBank, ...bankQuestions]);
    
    setCurrentStep(AppStep.REVIEW);
  };

  const handleRemixTest = (testId: string) => {
      if (!confirm(t('remixConfirm'))) return;
      const original = allTests.find(t => t.id === testId);
      if (!original) return;

      const shuffledQuestions = balanceQuestionDistributions(
          [...original.questions].sort(() => Math.random() - 0.5)
      );
      const shuffledOE = original.openEndedQuestions ? [...original.openEndedQuestions].sort(() => Math.random() - 0.5) : [];

      const remixedTest: Test = {
          ...original,
          id: `test-remix-${Date.now()}`,
          title: `${original.title} (Remix)`,
          questions: shuffledQuestions,
          openEndedQuestions: shuffledOE,
          createdAt: Date.now(),
      };
      
      setAllTests(prev => [remixedTest, ...prev]);
      setActiveTest(remixedTest);
      setCurrentStep(AppStep.REVIEW);
  };

  const handleRebuildTest = async (testId: string) => {
      if (!confirm(t('rebuildConfirm'))) return;
      const original = allTests.find(t => t.id === testId);
      if (!original || !original.sourceContent || !original.sourceConfig) return;

      // Reset state to original source values
      setTestTitle(original.title);
      setLearnerLevel(original.learnerLevel || LearnerLevel.BA);
      setTopics(original.sourceTopics || []);
      setContent(original.sourceContent);
      setTestLanguage(original.language);
      setQuestionConfig(original.sourceConfig);
      setManualText(original.sourceManualText || '');
      
      handleStartGeneration();
  };

  const handleDeleteTest = (testId: string) => {
      if (confirm('Are you sure you want to delete this test?')) {
          setAllTests(prev => prev.filter(t => t.id !== testId));
          if (activeTest?.id === testId) setActiveTest(null);
      }
  };
  
  const handleStartPractice = () => {
      if (activeTest) {
          setCurrentStep(AppStep.PRACTICE);
      }
  };

  const handleDoneFromReview = () => {
      navigateTo(AppStep.DASHBOARD);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    if (!activeTest) return;
    const updatedQuestions = activeTest.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q);
    const updatedTest = { ...activeTest, questions: updatedQuestions };
    setActiveTest(updatedTest);
    setAllTests(prevTests => prevTests.map(t => t.id === updatedTest.id ? updatedTest : t));
  };
  
  const handleAddQuestion = () => {
      if (!activeTest) return;
      const newQuestion: Question = {
          id: `custom-${Date.now()}`,
          question: 'New Question Stem',
          bloomLevel: BloomLevel.EASY,
          choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
          correctAnswerIndex: 0,
          shortExplanation: 'Explanation for the correct answer.',
          detailedExplanation: '',
          distractorExplanations: ['', '', '', ''],
      };
      const updatedTest = { ...activeTest, questions: [...activeTest.questions, newQuestion] };
      setActiveTest(updatedTest);
      setAllTests(prevTests => prevTests.map(t => t.id === updatedTest.id ? updatedTest : t));
  };

  const handleDeleteQuestion = (questionId: string) => {
      if (!activeTest) return;
      const filteredQuestions = activeTest.questions.filter(q => q.id !== questionId);
      const updatedTest = { ...activeTest, questions: filteredQuestions };
      setActiveTest(updatedTest);
      setAllTests(prevTests => prevTests.map(t => t.id === updatedTest.id ? updatedTest : t));
  };

  const resetTestState = () => {
      setActiveTest(null);
      setTestTitle('');
      setTopics([]);
      setContent('');
      setManualText('');
      setQuestionConfig(null);
      setIsPracticeEnabled(false);
  };

  const handleStartNewTest = () => {
      resetTestState();
      setCurrentStep(AppStep.SETUP);
  };

  const navigateTo = (step: AppStep) => {
    if (step === AppStep.DASHBOARD) {
      resetTestState();
    }
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case AppStep.DASHBOARD:
        return (
            <Dashboard 
                tests={allTests} 
                questionBank={questionBank} 
                navigateTo={navigateTo} 
                onStartNewTest={handleStartNewTest}
                onSelectTest={(test) => {
                    setActiveTest(test);
                    setCurrentStep(AppStep.REVIEW);
                }}
                onRemixTest={handleRemixTest}
                onRebuildTest={handleRebuildTest}
                onDeleteTest={handleDeleteTest}
            />
        );
      case AppStep.SETUP:
        return <Step1Setup 
            topics={topics}
            setTopics={setTopics}
            onNext={handleSetupSubmit} 
            onBack={() => navigateTo(AppStep.DASHBOARD)} 
            onClose={() => navigateTo(AppStep.DASHBOARD)}
            initialTitle={testTitle}
            initialLanguage={testLanguage}
            initialLevel={learnerLevel}
            initialManualText={manualText}
        />;
      case AppStep.CONFIGURATION:
        return (
            <Step2Configuration 
                testTitle={testTitle}
                topics={topics.join(', ')}
                onGenerate={handleConfigurationProceed}
                onBack={() => setCurrentStep(AppStep.SETUP)}
                initialConfig={questionConfig}
            />
        );
      case AppStep.REVIEW_GENERATE:
        if (!questionConfig) {
            setCurrentStep(AppStep.CONFIGURATION);
            return null;
        }
        return (
            <Step4ReviewGenerate
                testTitle={testTitle}
                learnerLevel={learnerLevel}
                language={testLanguage}
                topics={topics}
                config={questionConfig}
                isPracticeEnabled={isPracticeEnabled}
                onPracticeModeChange={setIsPracticeEnabled}
                onGenerate={handleStartGeneration}
                onBack={() => setCurrentStep(AppStep.CONFIGURATION)}
                onClose={() => navigateTo(AppStep.DASHBOARD)}
            />
        );
      case AppStep.GENERATING:
        return <Step3Generating />;
      case AppStep.REVIEW:
        if (activeTest) {
          return (
            <Step4Review
              test={activeTest}
              onUpdateQuestion={handleUpdateQuestion}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onStartPractice={handleStartPractice}
              onDone={handleDoneFromReview}
            />
          );
        }
        navigateTo(AppStep.DASHBOARD);
        return null;
      case AppStep.PRACTICE:
         if (activeTest) {
          return <PracticeSession test={activeTest} onDone={() => navigateTo(AppStep.DASHBOARD)} />;
        }
        navigateTo(AppStep.DASHBOARD);
        return null;
      case AppStep.QUESTION_BANK:
        return <QuestionBank questions={questionBank} />;
      default:
        return <Dashboard tests={allTests} questionBank={questionBank} navigateTo={navigateTo} onStartNewTest={handleStartNewTest} onSelectTest={setActiveTest} onRemixTest={handleRemixTest} onRebuildTest={handleRebuildTest} onDeleteTest={handleDeleteTest} />;
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans text-text-main">
      <Sidebar 
        currentStep={currentStep}
        navigateTo={navigateTo}
        onStartNewTest={handleStartNewTest}
        testsCreated={allTests.length}
        questionsBanked={questionBank.length}
        onOpenPromptModal={() => setIsPromptModalOpen(true)}
      />
      <main className="flex-1 overflow-y-auto p-8 relative">
        {renderStep()}
      </main>
      <PromptModal 
        isOpen={isPromptModalOpen} 
        onClose={() => setIsPromptModalOpen(false)} 
      />
    </div>
  );
};

export default App;
