import React, { useState } from 'react';
import { Test, Question, Language } from '../types';
import { useLanguage } from './LanguageProvider';
import { CheckCircleIcon, XCircleIcon, SparkleIcon } from './icons';
import { generateLearningFeedback } from '../services/geminiService';

interface PracticeSessionProps {
  test: Test;
  onDone: () => void;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({ test, onDone }) => {
  const { t, language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showDetailedExp, setShowDetailedExp] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const isFinished = currentQuestionIndex >= test.questions.length;
  const currentQuestion = !isFinished ? test.questions[currentQuestionIndex] : null;
  const userAnswerIndex = currentQuestion ? userAnswers[currentQuestion.id] : undefined;
  const isAnswered = userAnswerIndex !== undefined;

  const handleAnswerSelect = (choiceIndex: number) => {
    if (!currentQuestion || isAnswered) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: choiceIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowDetailedExp(false);
    } else {
      setCurrentQuestionIndex(test.questions.length); // Go to summary screen
    }
  };

  const calculateScore = () => {
    return test.questions.reduce((score, q) => {
        return userAnswers[q.id] === q.correctAnswerIndex ? score + 1 : score;
    }, 0);
  };

  const handleGetAiFeedback = async () => {
      setIsLoadingFeedback(true);
      try {
          const feedback = await generateLearningFeedback(test.title, test.questions, userAnswers, language);
          setAiFeedback(feedback);
      } catch (err) {
          console.error(err);
      } finally {
          setIsLoadingFeedback(false);
      }
  };

  if (isFinished) {
    const score = calculateScore();
    const total = test.questions.length;
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-bold text-primary mb-4">{t('practiceComplete')}</h2>
                <p className="text-xl text-text-light mb-6">{t('practiceScore')}:</p>
                <p className="text-6xl font-extrabold text-text-main mb-8">
                    {score} / {total}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <button
                        onClick={onDone}
                        className="px-8 py-4 bg-gray-200 text-text-main font-bold rounded-lg hover:bg-gray-300 transition-all shadow-sm"
                    >
                        {t('finishPractice')}
                    </button>
                    {!aiFeedback && (
                        <button
                            onClick={handleGetAiFeedback}
                            disabled={isLoadingFeedback}
                            className="px-8 py-4 bg-gradient-to-r from-secondary to-orange-400 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoadingFeedback ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('generatingFeedback')}
                                </>
                            ) : (
                                <>
                                    <SparkleIcon className="w-5 h-5" />
                                    {t('getAiFeedback')}
                                </>
                            )}
                        </button>
                    )}
                </div>

                {aiFeedback && (
                    <div className="mt-8 text-left p-6 bg-purple-50 rounded-2xl border border-primary/20 animate-fade-in" dir={language === Language.HE ? 'rtl' : 'ltr'}>
                        <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                            <SparkleIcon className="w-6 h-6" />
                            {t('learningFeedback')}
                        </h3>
                        <div className="prose prose-purple max-w-none text-text-main whitespace-pre-wrap">
                            {aiFeedback}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  }
  
  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-text-main">{t('practiceSessionTitle')}: {test.title}</h2>
        <p className="text-text-light">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
      </header>

      <div className="bg-card-bg p-8 rounded-xl shadow-md">
        <p className="text-xl text-text-main font-semibold mb-6">{currentQuestion.question}</p>
        
        <div className="space-y-3 mb-6">
            {currentQuestion.choices.map((choice, i) => {
                const isCorrect = i === currentQuestion.correctAnswerIndex;
                const isUserChoice = i === userAnswerIndex;
                let buttonClass = 'border-gray-300 bg-white hover:bg-gray-50';

                if (isAnswered) {
                    if (isCorrect) {
                        buttonClass = 'border-green-500 bg-green-50 font-semibold';
                    } else if (isUserChoice) {
                        buttonClass = 'border-red-500 bg-red-50 font-semibold';
                    } else {
                        buttonClass = 'border-gray-300 bg-white';
                    }
                }

                return (
                    <button
                        key={i}
                        onClick={() => handleAnswerSelect(i)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 ${buttonClass} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                       <span className="flex-grow">{String.fromCharCode(65 + i)}. {choice}</span>
                       {isAnswered && isCorrect && <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />}
                       {isAnswered && isUserChoice && !isCorrect && <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />}
                    </button>
                );
            })}
        </div>
        
        {isAnswered && (
          <div className="mt-6">
            <div className="p-4 rounded-e-lg bg-pink-50 border-s-4 border-secondary">
              <p className="text-text-main">
                <strong className="font-bold">{t('explanation')}:</strong>{' '}
                {userAnswerIndex === currentQuestion.correctAnswerIndex
                  ? currentQuestion.shortExplanation
                  : (currentQuestion.distractorExplanations &&
                      currentQuestion.distractorExplanations[userAnswerIndex]) ||
                    currentQuestion.shortExplanation}
              </p>
            </div>
            {currentQuestion.detailedExplanation && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDetailedExp(!showDetailedExp)}
                  className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
                >
                  {t('elaborateExplanation')}
                </button>
                {showDetailedExp && (
                  <p className="mt-2 text-sm text-text-light">
                    {currentQuestion.detailedExplanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-right">
            <button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {t('nextQuestion')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;