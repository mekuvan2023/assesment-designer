
import React, { useState, useEffect } from 'react';
import { Question, BloomLevel, QuestionType } from '../types';
import { useLanguage } from './LanguageProvider';
import { EditIcon, SaveIcon, TrashIcon } from './icons';

interface QuestionCardProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: (questionId: string) => void;
  practiceModeActive?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onUpdate, onDelete, practiceModeActive = false }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);
  const [showDetailedExp, setShowDetailedExp] = useState(false);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleInputChange = <K extends keyof Question,>(key: K, value: Question[K]) => {
    setEditedQuestion(prev => ({ ...prev, [key]: value }));
  };

  const handleChoiceChange = (choiceIndex: number, value: string) => {
    const newChoices = [...editedQuestion.choices];
    newChoices[choiceIndex] = value;
    handleInputChange('choices', newChoices);
  };
  
  const handleDistractorExpChange = (choiceIndex: number, value: string) => {
    const newExplanations = [...(editedQuestion.distractorExplanations || ['', '', '', ''])];
    newExplanations[choiceIndex] = value;
    handleInputChange('distractorExplanations', newExplanations);
  };

  const handleSave = () => {
    onUpdate(editedQuestion);
    setIsEditing(false);
  };

  const renderBloomBadge = (level: BloomLevel) => {
    const levelText = t(level === BloomLevel.EASY ? 'easy' : level === BloomLevel.MEDIUM ? 'medium' : 'hard');
    const color = level === BloomLevel.EASY ? 'bg-green-100 text-green-800' :
                  level === BloomLevel.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800';
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>{levelText}</span>;
  }
  
  const renderTypeBadge = (type: QuestionType | undefined) => {
    if (!type) return null;
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{type}</span>;
  }

  if (isEditing) {
    return (
      <div className="bg-card-bg p-6 rounded-xl shadow-md border border-primary">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">{t('question')}</label>
            <textarea
              value={editedQuestion.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">{t('choices')}</label>
            {editedQuestion.choices.map((choice, i) => (
              <div key={i} className="flex items-center mt-1">
                <input
                  type="radio"
                  name={`correct-answer-${editedQuestion.id}`}
                  checked={editedQuestion.correctAnswerIndex === i}
                  onChange={() => handleInputChange('correctAnswerIndex', i)}
                  className="me-2 text-primary focus:ring-primary"
                />
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => handleChoiceChange(i, e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">{t('explanation')}</label>
            <input
              type="text"
              value={editedQuestion.shortExplanation}
              onChange={(e) => handleInputChange('shortExplanation', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
            />
          </div>
           <div>
            <label className="block text-sm font-bold text-gray-700">{t('detailedExplanation')}</label>
            <textarea
              value={editedQuestion.detailedExplanation || ''}
              onChange={(e) => handleInputChange('detailedExplanation', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">{t('distractorExplanations')}</label>
            {(editedQuestion.distractorExplanations || ['', '', '', '']).map((exp, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Explanation for choice ${i+1}`}
                onChange={(e) => handleDistractorExpChange(i, e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded-md hover:bg-green-600">
            <SaveIcon className="w-5 h-5"/>
            {t('save')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="text-xl font-bold text-primary">{t('questionHeader')} {index + 1}</span>
            {renderBloomBadge(question.bloomLevel)}
            {renderTypeBadge(question.questionType)}
          </div>
          <p className="text-lg text-text-main">{question.question}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0 ms-4">
          <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full">
            <EditIcon className="w-5 h-5"/>
          </button>
           <button onClick={() => onDelete(question.id)} className="p-2 text-gray-500 hover:text-secondary hover:bg-red-50 rounded-full">
            <TrashIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {question.choices.map((choice, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border text-base transition-colors ${
              !practiceModeActive && i === question.correctAnswerIndex
                ? 'bg-green-50 border-green-400 font-semibold text-green-800'
                : 'bg-gray-50 border-gray-200 text-text-light'
            }`}
          >
            {String.fromCharCode(65 + i)}. {choice}
          </div>
        ))}
      </div>
      {!practiceModeActive && question.shortExplanation && (
        <div className="mt-4">
            <div className="p-4 bg-pink-50 border-s-4 border-secondary rounded-e-lg">
              <p><strong className="font-bold">{t('explanation')}:</strong> {question.shortExplanation}</p>
            </div>
            {question.detailedExplanation && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDetailedExp(!showDetailedExp)}
                  className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
                >
                  {t('elaborateExplanation')}
                </button>
                {showDetailedExp && (
                  <div className="mt-2 p-4 bg-purple-50 border-s-4 border-primary rounded-e-lg">
                    <p><strong className="font-bold">{t('detailedExplanation')}:</strong> {question.detailedExplanation}</p>
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
