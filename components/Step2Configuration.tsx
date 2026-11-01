import React, { useState, useMemo } from 'react';
import { useLanguage } from './LanguageProvider';
import { QuestionConfig } from '../types';
import { CheckIcon } from './icons';

interface Step2ConfigurationProps {
  testTitle: string;
  topics: string;
  onGenerate: (config: QuestionConfig) => void;
  onBack: () => void;
  initialConfig: QuestionConfig | null;
}

const initialConfigDefault: QuestionConfig = {
  mcq: {
    direct: 7,
    completion: 7,
    caseBased: 7,
    negativeStem: 3,
    matchingSequencing: 3,
    causeEffect: 3,
  },
  difficulty: {
    easy: 10,
    medium: 10,
    hard: 10,
  },
  openEnded: 3,
};

const Stepper: React.FC<{ currentStep: number, steps: {name: string}[] }> = ({ currentStep, steps }) => (
    <div className="flex items-center">
        {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
                <React.Fragment key={step.name}>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                            isActive ? 'bg-secondary text-white shadow-lg scale-110' : isCompleted ? 'bg-pink-300 text-white' : 'bg-gray-200 text-text-light'
                        }`}>
                           {isCompleted ? <CheckIcon className="w-6 h-6" /> : stepNumber}
                        </div>
                        <div className={`mt-2 text-sm text-center font-semibold ${isActive ? 'text-text-main' : 'text-text-light'}`}>
                            {step.name}
                        </div>
                    </div>
                    {stepNumber < steps.length && <div className={`flex-auto border-t-2 mx-4 transition-colors duration-500 ease-in-out ${isCompleted || isActive ? 'border-pink-300' : 'border-gray-200'}`}></div>}
                </React.Fragment>
            );
        })}
    </div>
);

const ConfigInputRow: React.FC<{
    label: string;
    description: string;
    value: number;
    onChange: (value: number) => void;
}> = ({ label, description, value, onChange}) => (
    <div className="grid grid-cols-3 items-center gap-4">
        <div className="col-span-2">
            <p className="font-semibold text-text-main">{label}</p>
            <p className="text-sm text-text-light">{description}</p>
        </div>
        <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
            className="w-full rounded-md border-gray-300 shadow-sm text-center font-semibold text-lg p-2 focus:border-primary focus:ring-primary"
        />
    </div>
);

const Step2Configuration: React.FC<Step2ConfigurationProps> = ({ testTitle, topics, onGenerate, onBack, initialConfig }) => {
  const { t } = useLanguage();
  const [config, setConfig] = useState<QuestionConfig>(initialConfig || initialConfigDefault);

  const handleMcqChange = (key: keyof QuestionConfig['mcq'], value: number) => {
    setConfig(prev => ({ ...prev, mcq: { ...prev.mcq, [key]: value } }));
  };

  const handleDifficultyChange = (key: keyof QuestionConfig['difficulty'], value: number) => {
    setConfig(prev => ({ ...prev, difficulty: { ...prev.difficulty, [key]: value } }));
  };
  
  const handleOpenEndedChange = (value: number) => {
    setConfig(prev => ({ ...prev, openEnded: value }));
  };

  const totals = useMemo(() => {
    // FIX: Explicitly type the accumulator 'sum' as a number to prevent type inference issues.
    const mcqTotal = Object.values(config.mcq).reduce((sum: number, val) => sum + Number(val), 0);
    // FIX: Explicitly type the accumulator 'sum' as a number to prevent type inference issues.
    const difficultyTotal = Object.values(config.difficulty).reduce((sum: number, val) => sum + Number(val), 0);
    const openEndedTotal = config.openEnded;
    const totalQuestions = mcqTotal + openEndedTotal;
    return { mcqTotal, difficultyTotal, openEndedTotal, totalQuestions };
  }, [config]);

  const mcqStructure = [
      { key: 'direct', label: t('directQuestion'), desc: t('directQuestionDesc')},
      { key: 'completion', label: t('completion'), desc: t('completionDesc')},
      { key: 'caseBased', label: t('caseBased'), desc: t('caseBasedDesc')},
      { key: 'negativeStem', label: t('negativeStem'), desc: t('negativeStemDesc')},
      { key: 'matchingSequencing', label: t('matchingSequencing'), desc: t('matchingSequencingDesc')},
      { key: 'causeEffect', label: t('causeEffect'), desc: t('causeEffectDesc')},
  ] as const;

  const difficultyStructure = [
      { key: 'easy', label: t('easy'), desc: 'Remember / Understand' },
      { key: 'medium', label: t('medium'), desc: 'Apply / Analyze' },
      { key: 'hard', label: t('hard'), desc: 'Evaluate / Create' },
  ] as const;

  const isMismatch = totals.mcqTotal !== totals.difficultyTotal;

  const stepperSteps = useMemo(() => [
      { name: t('step1_basicInfo') },
      { name: t('step3_config') },
      { name: t('step4_review') },
  ], [t]);

  const subTitle = `${testTitle || 'undefined'} ${t('stepperSubtitle')}`
    .replace('{step}', '2')
    .replace('{stepName}', t('step3_config'));

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-text-main">{t('createNewTestTitle')}</h1>
        <p className="text-text-light">{subTitle}</p>
      </header>
      
      <div className="mb-8 px-4"><Stepper currentStep={2} steps={stepperSteps} /></div>

        <div className="bg-card-bg p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-text-main text-center mb-2">{t('questionConfiguration')}</h2>
             <p className="text-text-light text-center mb-8">Configure the distribution and difficulty of questions in your test.</p>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {/* MCQ Distribution */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-main">{t('multipleChoiceDistribution')}</h3>
                    {mcqStructure.map(item => (
                       <ConfigInputRow 
                            key={item.key}
                            label={item.label}
                            description={item.desc}
                            value={config.mcq[item.key]}
                            onChange={(v) => handleMcqChange(item.key, v)}
                       />
                    ))}
                </div>

                {/* Difficulty and Open-ended */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-text-main mb-6">{t('difficultyLevels')}</h3>
                        <div className="space-y-6">
                            {difficultyStructure.map(item => (
                                <ConfigInputRow 
                                    key={item.key}
                                    label={item.label}
                                    description={item.desc}
                                    value={config.difficulty[item.key]}
                                    onChange={(v) => handleDifficultyChange(item.key, v)}
                                />
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-text-main mb-6">{t('openEndedQuestions')}</h3>
                        <ConfigInputRow 
                            label={t('openEndedQuestions')}
                            description={t('openEndedQuestionsDesc')}
                            value={config.openEnded}
                            onChange={handleOpenEndedChange}
                        />
                    </div>
                </div>
            </div>

            {/* Totals and Warning */}
            <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg flex flex-wrap justify-around items-center text-center">
                    <div className="font-semibold text-gray-800">
                        {t('totalMCQ')}: <span className="text-xl font-bold">{totals.mcqTotal}</span> 
                        <span className="text-gray-500 text-base"> (dist: {totals.difficultyTotal})</span>
                    </div>
                    <div className="font-semibold text-gray-800">
                        {t('totalOpenEnded')}: <span className="text-xl font-bold">{totals.openEndedTotal}</span>
                    </div>
                    <div className="font-semibold text-pink-600">
                        {t('totalQuestions')}: <span className="text-2xl font-extrabold">{totals.totalQuestions}</span>
                    </div>
                </div>
                {isMismatch && (
                    <p className="text-red-600 text-center font-semibold mt-4">
                        {t('mcqWarning')
                            .replace('{mcqTotal}', totals.mcqTotal.toString())
                            .replace('{difficultyTotal}', totals.difficultyTotal.toString())
                        }
                    </p>
                )}
            </div>

            <div className="flex justify-between items-center pt-8 mt-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 bg-gray-200 text-text-light font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                {t('back')}
              </button>
              <button
                type="button"
                onClick={() => onGenerate(config)}
                disabled={isMismatch}
                className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-secondary to-orange-400 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:hover:scale-100"
              >
                {t('next')} →
              </button>
            </div>
        </div>
    </div>
  );
};

export default Step2Configuration;