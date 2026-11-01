

import React from 'react';
import { Question } from '../types';
import { useLanguage } from './LanguageProvider';
import QuestionCard from './QuestionCard';

interface QuestionBankProps {
  questions: Question[];
}

const QuestionBank: React.FC<QuestionBankProps> = ({ questions }) => {
  const { t } = useLanguage();

  const handleUpdate = () => {
    // In a real implementation, this would update the question in the central bank
    console.log("Update action triggered from question bank.");
  };

  const handleDelete = () => {
    // In a real implementation, this would delete the question from the central bank
    console.log("Delete action triggered from question bank.");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-text-main mb-6">{t('questionBankTitle')}</h2>
      
      {questions.length > 0 ? (
        <div className="space-y-6">
          {questions.map((q, index) => (
            <QuestionCard 
              key={q.id}
              question={q}
              index={index}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card-bg rounded-xl shadow-sm">
          <p className="text-text-light">{t('questionBankEmpty')}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;